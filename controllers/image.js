const { ImgurClient } = require('imgur');
const { appError } = require('../exceptions/index');
const { successHandle } = require('../service/index');
const { HTTP_STATUS, ERROR_MESSAGE } = require('../constants/index');

const image = {
    async upload(req, res, next) {
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