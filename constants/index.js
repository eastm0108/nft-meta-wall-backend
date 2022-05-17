const HTTP_STATUS = {
    SUCCESS: 200,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
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
        DEFAULT: '錯誤'
    };

    return _message[errorKey] || _message['DEFAULT'];

};

module.exports = {
    HTTP_STATUS,
    ERROR_MESSAGE
};
