const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/post');
const { checkUserId, checkPostId } = require('../middleware/checkId');
const { isAuth } = require('../middleware/auth');
const { handleErrorAsync } = require('../middleware/handleErrorAsync');

// 取得所有貼文
router.get('/posts', isAuth, handleErrorAsync(PostsControllers.getPosts));
// 取得指定 user 所有貼文
router.get('/posts/user/:id', isAuth, checkUserId, handleErrorAsync(PostsControllers.getPosts));
// 取得指定 post 貼文
router.get('/post/:id', isAuth, checkPostId, handleErrorAsync(PostsControllers.getPost));


// 新增貼文
router.post('/post', isAuth, handleErrorAsync(PostsControllers.addPost));
// 新增指定貼文內留言
router.post('/post/:id/comments', isAuth, checkPostId, handleErrorAsync(PostsControllers.addPostComment));


// 修改指定貼文
router.patch('/post/:id', isAuth, checkPostId, handleErrorAsync(PostsControllers.updatePost));
// 修改指定貼文按讚數
router.patch('/post/:id/likes', isAuth, checkPostId, handleErrorAsync(PostsControllers.updatePostLikes));


// 刪除指定貼文
router.delete('/post/:id', isAuth, checkPostId, handleErrorAsync(PostsControllers.deletePost));


module.exports = router;
