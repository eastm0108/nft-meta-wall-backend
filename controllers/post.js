const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const LikesPost = require('../models/likesPost');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');
const { successHandle } = require('../service/index');
const { appError } = require('../exceptions/index');
const { checkType } = require('../helper/utils');

const post = {
    /** 找尋全部貼文 */
    async getPosts(req, res, next) {
        // 取得指定 userId
        const { id: userId } = req.params;
        let { keyword, timeSort, limit = 10, page = 1 } = req.body;

        if (
            checkType(typeof keyword, ['object', 'number', 'symbol', 'boolean'])
            || (typeof keyword === 'string' && keyword === '')
        ) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'keyword 錯誤'),
            ));
        }

        if (checkType(typeof timeSort, ['object', 'symbol', 'boolean'])) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'timeSort 錯誤'),
            ));
        }

        if (!checkType(typeof limit, ['number', 'undefined'])) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'limit 錯誤'),
            ));
        }

        if (!checkType(typeof page, ['number', 'undefined'])) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'page 錯誤'),
            ));
        }

        const filter = keyword ? { content: new RegExp(`${keyword}`) } : {};
        const sort = timeSort === 'asc' || timeSort === 1 ? { createAt: 1 } : { createAt: -1 };

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            filter.author = mongoose.Types.ObjectId(userId);
        }

        page < 0 ? page = 1 : page;
        const skip = limit * (page - 1);

        const count = await Post.find(filter).count();
        const posts = await Post.find(filter).sort(sort).skip(skip).limit(limit).populate({
            path:'author',
            select: 'name avatar',
        });

        const resPosts = posts.map((item) => {
            return {
                id: item._id,
                author: item.author,
                tags: item.tags,
                type: item.type,
                content: item.content,
                image: item.image,
                comments: item.comments,
                createAt: item.createAt,
                likes: item.likes,
            };
        });

        const payload = { count, limit, page, posts: resPosts };

        successHandle(res, payload, '成功取得全部貼文');
    },
    /** 找尋單筆貼文 */
    async getPost(req, res, next) {
        const { id } = req.params;
        const post = await Post.findById(id);

        successHandle(res, post)
    },
    /** 新增單筆貼文 */
    async addPost(req, res, next) {
        const { userId: author, content, image } = req.body;

        if (!author) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '無使用者 id'),
            ));
        }

        if (!content) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '沒貼文內容'),
            ));
        }

        const newPost = await Post.create({ author, content, image });
        successHandle(res, newPost, '新增貼文成功');
    },
    /** 新增指定貼文內留言 */
    async addPostComment(req, res, next) {
        const { id } = req.params;
        const { userId, comment } = req.body;

        if (!userId && !mongoose.Types.ObjectId.isValid(userId)) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'userId 錯誤'),
            ));
        }

        if (!checkType(typeof comment, ['string']) || comment === '') {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', 'comment 錯誤'),
            ));
        }

        const postComment = { user: userId, comment };
        const post = await Post.findByIdAndUpdate(id, { $push: { comments: postComment } }, { returnDocument: 'after' })

        successHandle(res, post, '新增留言成功');
    },
    /** 修改指定貼文 */
    async updatePost(req, res, next) {
        const { id } = req.params;
        const { content, image } = req.body;

        if (!content) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('ERROR_REQUEST', '請輸入要更新的貼文內容'),
            ));
        }

        const post = await Post.findByIdAndUpdate(id, { content, image }, { returnDocument: 'after' });

        successHandle(res, post, '更新貼文內容成功')
    },
    /** 修改指定貼文按讚數 */
    async updatePostLikes(req, res, next) {
        const { id } = req.params;
        const { userId } = req.body;

        const isLike = await Post.find({ _id: id, likes: { $in: [ userId ] } });
        let method = '';

        // 檢查裡面有沒有資料(收回讚/按讚)
        if (isLike.length) {
            method = '$pull';
        } else {
            method = '$push';
        }

        const post = await Post.findByIdAndUpdate(id, { [method]: { likes: userId } }, { returnDocument: 'after' })
    
        await LikesPost.findOneAndUpdate({ userId: userId }, { [method]: { posts: id } }, { returnDocument: 'after' })
    
        successHandle(res, post, '更新成功')
    },
    /** 刪除單筆貼文 */
    async deletePost(req, res, next) {
        const { id } = req.params;

        const post = await Post.findByIdAndDelete(id);
        successHandle(res, post, '刪除貼文成功');
    },

};

module.exports = post;
