var express = require('express');
var router = express.Router();
const PostsControllers = require('../controllers/post');
const { checkUserId, checkPostId } = require('../middleware/checkId');
const { handleErrorAsync } = require('../middleware/handleErrorAsync');

// 取得所有貼文
router.get('/posts', handleErrorAsync(PostsControllers.getPosts));
// 取得指定 user 所有貼文
router.get('/posts/user/:id', checkUserId, handleErrorAsync(PostsControllers.getPosts));
// 取得指定 post 貼文
router.get('/post/:id', checkPostId, handleErrorAsync(PostsControllers.getPost));


// 新增貼文
router.post('/post', handleErrorAsync(PostsControllers.addPost));
// 新增指定貼文內留言
router.post('/post/:id/comments', checkPostId, handleErrorAsync(PostsControllers.addPostComment));


// 修改指定貼文
router.patch('/post/:id', checkPostId, handleErrorAsync(PostsControllers.updatePost));
// 修改指定貼文按讚數
router.patch('/post/:id/likes', checkPostId, handleErrorAsync(PostsControllers.updatePostLikes));


// 刪除指定貼文
router.delete('/post/:id', checkPostId, handleErrorAsync(PostsControllers.deletePost));


module.exports = router;
