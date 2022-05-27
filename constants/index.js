const HTTP_STATUS = {
    SUCCESS: 200,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    DENIED_PERMISSION: 401,
    INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGE = (errorKey, customMessage = '') => {
    const _message = {
        NOT_FOUND_ROUTE: '查無此頁面，' + customMessage,
        DATA_ERROR: '資料錯誤，' + customMessage,
        ERROR_REQUEST: '錯誤參數，' + customMessage,
        CREATE_ERROR: '建立失敗，' + customMessage,
        UPDATE_ERROR: '更新失敗，' + customMessage,
        NOT_FOUND_ID: '查無此 ID，' + customMessage,
        NOT_FOUND_ID_OR_DATA_ERROR: '查無此 ID 或是資料錯誤，' + customMessage,
        DENIED_PERMISSION: '使用者尚未登入！' + customMessage,
        TYPING_EMAIL_CODE: '請輸入 E-mail 取得驗證碼' + customMessage,
        REFRESH_LOGIN: '認證失敗，請重新登入' + customMessage,
        DEFAULT: '錯誤' + customMessage,
    };

    return _message[errorKey] || _message['DEFAULT'];

};

module.exports = {
    HTTP_STATUS,
    ERROR_MESSAGE
};
