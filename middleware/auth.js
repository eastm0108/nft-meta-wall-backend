const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { appError } = require('../exceptions/index');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');
const { successHandle } = require('../service/index');
const { handleErrorAsync } = require('../middleware/handleErrorAsync');

/** 產生 使用者資料與 JWT
 * @param {*} user 使用者資料
 * @param {*} res express 原生 response
 * @param {*} isResetPassword 是否是重置密碼
 */
const generateSendJWT = (user, res, isResetPassword = false) => {
  // 判斷過期時間
  const expire = isResetPassword
    ? process.env.JWT_EXPIRES_RESET_PASSWORD_DAY
    : process.env.JWT_EXPIRES_DAY;

  // 產生 JWT token
  const token = jwt.sign({ id: user._id, isResetPassword }, process.env.JWT_SECRET, {
    expiresIn: expire,
  });

  let newUser = {
    id: user._id,
    name: user.name,
    avatar: user.avatar,
    token,
  }

  // 判斷是否是重置密碼
  if (isResetPassword) {
    newUser = {
      token,
    }
  }

  successHandle(res, newUser, '成功產生使用者登入資料');
}

/** 檢查 headers 內 token 驗證 */
const isAuth = handleErrorAsync(async (req, res, next) => {
  let token = null;

  // 檢查 headers 有沒有傳 token 跟是否是 JWT 格式
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 判斷有無 token
  if (!token) {
    return next(appError(
      HTTP_STATUS.DENIED_PERMISSION,
      ERROR_MESSAGE('DENIED_PERMISSION'),
    ));
  }

  // 驗證 token 正確性
  const decoded = await jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return next(appError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE('DATA_ERROR', 'token 錯誤'),
      ));
    } else {
      return payload;
    }
  });

  // 重置密碼
  if (decoded.isResetPassword) {
    return next(appError(
      HTTP_STATUS.DENIED_PERMISSION,
      ERROR_MESSAGE('REFRESH_LOGIN'),
    ));
  }

  // 檢查 decoded 解析
  if (decoded) {
    // 用 decoded完資料內 ID 找使用者資料
    const currentUser = await User.findById(decoded.id);

    // req 加上 user 資訊，傳回路由
    req.user = currentUser;

    next();
  }
})

/** 重置密碼驗證 (email 用) */
const verificationAuth = handleErrorAsync(async (req, res, next) => {
  let token = null;

  // 檢查 headers 有沒有傳 token 跟是否是 JWT 格式
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 判斷有無 token
  if (!token) {
    return next(appError(
      HTTP_STATUS.DENIED_PERMISSION,
      ERROR_MESSAGE('TYPING_EMAIL_CODE'),
    ));
  }

  // 驗證 token 正確性
  const decoded = await jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return next(appError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE('DATA_ERROR', '認證失敗，請重新輸入E-mail 取得驗證碼'),
      ));
    } else {
      return payload;
    }
  })

  // 不是重置密碼
  if (!decoded.isResetPassword) {
    return next(appError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGE('DATA_ERROR', '認證失敗，請重新輸入E-mail 取得驗證碼'),
    ));
  }

  // 檢查 decoded 解析
  if (decoded) {
    // 用 decoded完資料內 ID 找使用者資料
    const currentUser = await User.findById(decoded.id);

    // req 加上 user 資訊，傳回路由
    req.user = currentUser;

    next();
  }
})

module.exports = {
  generateSendJWT,
  isAuth,
  verificationAuth,
}