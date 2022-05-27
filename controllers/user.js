const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user');
const LikesPost = require('../models/likesPost');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');
const { successHandle } = require('../service/index');
const { appError } = require('../exceptions/index');
const { checkType } = require('../helper/utils');
const { generateSendJWT } = require('../middleware/auth');
const { filterParams } = require('../helper/utils');

const user = {
    /** 取得使用者資訊 */
    async getProfile(req, res, next) {
        const { id } = req.params;

        const profile = await User.findOne({ _id: id });

        if (!profile) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '查無此用戶'),
            ));
        }

        successHandle(res, profile, '取得使用者資訊');
    },
    /** 取得使用者追蹤人員 */
    async getUserFollow(req, res, next) {
        const id = req.user._id;

        const user = await User.findOne({ _id: id }).populate({
            path: 'follow',
            select: '_id author content image createdAt',
            populate: { path:'user', select: 'name avatar' },
        });

        if (!user) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '查無此用戶'),
            ));
        }

        successHandle(res, user, '取得使用者追蹤者');
    },
    /** 取得使用者按讚名單 */
    async getUserLikeList(req, res, next) {
        const { _id } = req.user;

        const result = await LikesPost.findOne({ userId: _id }).populate({
            path: 'posts',
            populate: { path:'post', select: '_id author content image name avatar' },
        });

        result.posts.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });

        successHandle(res, result, '取得使用者按讚名單');
    },
    /** 創建使用者資訊 */
    async createUser(req, res, next) {
        let { email, password, confirmPassword, name } = req.body;

        // 內容不可為空
        if (!email || !password || !confirmPassword || !name) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '欄位未填寫正確！'),
            ));
        }

        // 密碼正確
        if (password !== confirmPassword) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '密碼不一致！'),
            ));
        }

        // 密碼至少要 8 碼以上
        if (!validator.isLength(password, { min: 8 })) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '密碼字數低於 8 碼'),
            ));
        }

        // 密碼需英數混合
        if (validator.isNumeric(password) || validator.isAlpha(password)) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '密碼需英數混合'),
            ));
        }

        // 暱稱 2 個字以上
        if (!validator.isLength(name, { min: 2 })) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '暱稱字數低於 2 碼'),
            ));
        }

        // 是否為 Email
        if (!validator.isEmail(email)) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'Email 格式不正確'),
            ));
        }

        const hasEmail = await User.findOne({ email });

        if (hasEmail) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '此 email 已被註冊'),
            ));
        }

        // 加密密碼，混肴 12 次
        password = await bcrypt.hash(password, 12);

        // 新創使用者
        const newUser = await User.create({
            email,
            password,
            name,
        });

        // 新創使用者喜歡文章
        await LikesPost.create({ userId: newUser._id });

        generateSendJWT(newUser, res);
    },
    /** 登入 */
    async login(req, res, next) {
        let { email, password } = req.body;

        // 檢查空資料
        if (!email || !password) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '欄位未填寫正確！'),
            ));
        }

        // 是否為 Email
        if (!validator.isEmail(email)) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'Email 格式不正確'),
            ));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '輸入的帳號或密碼不正確'),
            ));
        }

        const auth = await bcrypt.compare(password, user.password);

        if (!auth) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '輸入的帳號或密碼不正確'),
            ));
        }

        generateSendJWT(user, res, false);
    },
    /** 更新使用者追蹤人員 */
    async updateUserFollow(req, res, next) {
        const id = req.user._id;
        const { id: followId } = req.params;
        let method = '';

        const userInfo = await User.findById(id);

        const check = userInfo.follow.find(item => item.id === followId);

        check === undefined ? method = '$push' : method = '$pull';

        await User.findByIdAndUpdate(id, {
            [method]: { follow: { user: followId, } }
        });

        await User.findByIdAndUpdate(followId, {
            [method]: { beFollowed: { user: id } }
        });

        const user = await User.findById(followId);

        const beFollowers = user.beFollowed.length;

        successHandle(res, { follow: followId, fans: beFollowers }, '成功更新使用者追蹤人員');
    },
    /** 更新使用者資訊 */
    async updateProfile(req, res, next) {
        const dataTypes = ['string'];
        const genderTypes = ['female', 'male', 'notKnown'];
        const { _id } = req.user;
        const { name, avatar, sex } = req.body;
        const data = { name, avatar, sex };
        const filterObj = filterParams(data);

        // no data
        if (Object.keys(filterObj).length <= 0) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '沒有傳送任何參數資料，無法更新'),
            ));
        }

        for (const key in filterObj) {
            // check type
            if (!dataTypes.includes(typeof filterObj[key])) {
                return next(appError(
                    HTTP_STATUS.BAD_REQUEST,
                    ERROR_MESSAGE('ERROR_REQUEST', `${key} 資料格式錯誤，目前為：${typeof filterObj[key]}，請為字串`),
                ));
            }

            // check enum
            if (key === 'sex' && !genderTypes.includes(filterObj[key])) {
                return next(appError(
                    HTTP_STATUS.BAD_REQUEST,
                    ERROR_MESSAGE('ERROR_REQUEST', `性別資料格式錯誤，目前為：${filterObj[key]}，請為：'female', 'male', 'notKnown'`),
                ));
            }

            // 暱稱 2 個字以上
            if (key === 'name' && !validator.isLength(name, { min: 2 })) {
                return next(appError(
                    HTTP_STATUS.BAD_REQUEST,
                    ERROR_MESSAGE('ERROR_REQUEST', '暱稱字數低於 2 碼'),
                ));
            }
        }

        const userInfo = await User.findByIdAndUpdate({_id: _id}, filterObj, { returnDocument: 'after' });

        successHandle(res, userInfo, '更新成功');
    },
    /** 更新使用者密碼 */
    async updatePassword(req, res, next) {
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '欄位未正確填寫！'),
            ));
        }

        // 密碼正確
        if (password !== confirmPassword) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '密碼不一致！'),
            ));
        }

        // 密碼至少要 8 碼以上
        if (!validator.isLength(password, { min: 8 })) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '密碼字數低於 8 碼'),
            ));
        }

        // 密碼需英數混合
        if (validator.isNumeric(password) || validator.isAlpha(password)) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '密碼需英數混合'),
            ));
        }

        const newPassword = await bcrypt.hash(password, 12);

        const user = await User.findByIdAndUpdate(req.user._id, {
            password: newPassword,
        });

        generateSendJWT(user, res, false);
    },
    /** 重置使用者密碼(未實作) */
    async resetPassword(req, res, next) {
    },
}

module.exports = user;