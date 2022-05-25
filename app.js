const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');


// exceptions 錯誤處理
const {
  uncaughtException,
  unhandledRejection,
  errorHandle,
  error404,
} = require("./exceptions");


// router
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');


// app 實體
const app = express();


// db connection
require('./connection');


// middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// swagger
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));


// use route
app.use('/api', postRouter);
app.use('/api/user', userRouter)


// catch 404 and forward to error handler
app.use(error404);
// error handler
app.use(errorHandle);


// 未捕捉到的 catch
process.on("unhandledRejection", unhandledRejection);
// 程式出現重大錯誤時
process.on("uncaughtException", uncaughtException);


module.exports = app;
