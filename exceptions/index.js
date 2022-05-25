// 套件錯誤事件
const ErrorEvents = {
    'AxiosError': (err, res) => {
        err.message = 'Axios 連線錯誤';
        err.isOperational = true;

        return resErrorProd(err, res);
    },
    'ValidationError': (err, res) => {
        err.isOperational = true;

        return resErrorProd(err, res);
    },
    'SyntaxError': (err, res) => {
        err.isOperational = true;
        err.statusCode = 400;
        err.message = '資料格式錯誤';

        return resErrorProd(err, res);
    },
    'Default': (err, res) => {
        return resErrorProd(err, res);
    }
};


// 一般錯誤處理
const appError = (httpStatus, errMessage) => {
    const error = new Error(errMessage);
    error.statusCode = httpStatus;
    error.isOperational = true;

    return error;
};

// dev 錯誤處理
const resErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

// production 錯誤處理
const resErrorProd = (err, res) => {
    // 自定義錯誤
    if (err.isOperational) {
        res.status(err.statusCode).json({
            message: err.message,
        });
    } else {
        // log 紀錄
        console.error("出現重大錯誤", err);

        // 送出罐頭預設訊息
        res.status(500).json({
            status: "error",
            message: "系統錯誤，請恰系統管理員",
        });
    }
};

// 錯誤處理, error handler, final
const errorHandle = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    // dev
    if (process.env.NODE_ENV === "development") {
        return resErrorDev(err, res);
    }

    // production
    if (process.env.NODE_ENV === 'production') {
        // Axios 錯誤
        err.isAxiosError && (err.name = 'AxiosError');

        ErrorEvents[err.name](err, res) || ErrorEvents['Default'](err, res);
    }
};

// 程式出現重大錯誤時
const uncaughtException = (err) => {
    // 記錄錯誤下來，等到服務都處理完後，停掉該 process
    console.error("Uncaught Exception！");
    console.error(`err name: ${err.name}`);
    console.error(`err message: ${err.message}`);
    console.error(`err stack: ${err.stack}`);
    process.exit(1);
};

// 未捕捉到的 catch
const unhandledRejection = (reason, promise) => {
    // 記錄於 log 上
    console.error("未捕捉到的 rejection：", promise, "原因：", reason);
};

const error404 = (req, res, next) => {
    res.status(404).json({
        status: "error",
        message: "無此路由資訊",
    });
};

module.exports = {
    uncaughtException,
    unhandledRejection,
    appError,
    errorHandle,
    error404,
};
