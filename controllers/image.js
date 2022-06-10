const { ImgurClient } = require('imgur');
const { appError } = require('../exceptions/index');
const { successHandle } = require('../service/index');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');
// 圖片限制大小
const LIMIT_FILE_SIZE = 1000000;

const image = {
    async upload(req, res, next) {
        if (!req.files[0]) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('DATA_ERROR', '請選擇一張圖片上傳'),
            ));
        }

        if (req.files[0]?.size > LIMIT_FILE_SIZE) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('DATA_ERROR', '圖片檔案過大，僅限 1mb 以下檔案'),
            ));
        }

        // 產生 imgur client
        const client = new ImgurClient({
            clientId: process.env.IMGUR_CLIENTID,
            clientSecret: process.env.IMGUR_CLIENT_SECRET,
            refreshToken: process.env.IMGUR_REFRESH_TOKEN,
        });

        const response = await client.upload({
            image: req.files[0].buffer.toString('base64'),
            type: 'base64',
            album: process.env.IMGUR_ALBUM_ID,
        });

        if (!response.success) {
            return next(appError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_MESSAGE('DATA_ERROR', '上傳失敗，請重新上傳'),
            ));
        }

        successHandle(res, { imageUrl: response.data.link }, '成功上傳圖片');
    },
}

module.exports = image;