const express = require('express');
const router = express.Router();
const upload = require('../service/image');
const ImageControllers = require('../controllers/image');
const { handleErrorAsync } = require('../middleware/handleErrorAsync');
const { isAuth } = require('../middleware/auth');

router.post('/', isAuth, upload, handleErrorAsync(ImageControllers.upload));


module.exports = router;