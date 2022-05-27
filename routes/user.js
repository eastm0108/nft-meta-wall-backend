const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/user');
const { handleErrorAsync } = require('../middleware/handleErrorAsync');
const { checkUserId } = require('../middleware/checkId');
const { isAuth, verificationAuth } = require('../middleware/auth');

// 取得使用者資訊
router.get('/profile/:id', isAuth, checkUserId, handleErrorAsync(UsersControllers.getProfile));
// 取得使用者追蹤名單
router.get('/following', isAuth, handleErrorAsync(UsersControllers.getUserFollow));
// 取得使用者按讚名單
router.get('/getLikeList', isAuth, handleErrorAsync(UsersControllers.getUserLikeList));


// 使用者註冊
router.post('/register', handleErrorAsync(UsersControllers.createUser));
// 使用者登入
router.post('/login', handleErrorAsync(UsersControllers.login));


// 更新使用者追蹤名單
router.patch('/follow/:id', isAuth, checkUserId, handleErrorAsync(UsersControllers.updateUserFollow));
// 更新使用者資料
router.patch('/profile', isAuth, handleErrorAsync(UsersControllers.updateProfile));
// 更新使用者密碼
router.patch('/updatePassword', isAuth, handleErrorAsync(UsersControllers.updatePassword));
// 重置使用者密碼(未實作)
// router.patch('/resetPassword', verificationAuth, handleErrorAsync(UsersControllers.resetPassword));


module.exports = router;