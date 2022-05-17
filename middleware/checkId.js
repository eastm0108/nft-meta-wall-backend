const mongoose = require('mongoose');
const { appError } = require('../exceptions/index');
const Post = require('../models/post');
const User = require('../models/user');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');

const checkPostId = async (req, res, next) => {
  const { id } = req.params;
  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!isValidId) {
    return next(appError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE('DATA_ERROR', '貼文 ID 請重新確認')), next);
  }

  const post = await Post.findById(id);

  if (!post) {
    return next(appError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE('NOT_FOUND_ID', '此篇貼文已不存在')), next);
  }

  next();
}

const checkUserId = async (req, res, next) => {
  const { id } = req.params;
  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!isValidId) {
    return next(appError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE('DATA_ERROR', '使用者 ID 格式錯誤，請重新確認')), next);
  }

  const user = await User.findById(id);

  if (!user) {
    return next(appError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE('NOT_FOUND_ID', '查無此使用者')), next);
  }

  next();
}
module.exports = {
  checkPostId,
  checkUserId
}