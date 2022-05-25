const nodemailer = require('nodemailer');
const { successHandle } = require('../service/index');
const { appError } = require('../exceptions/index');

const sendEmail = (user, verification, res, next) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: process.env.NODE_MAILER,
            pass: process.env.NODE_MAILER_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.NODE_MAILER,
        to: user.email,
        subject: 'NFT-META-WALL 重置密碼驗證碼',
        html: `
        <html>
            <table width="100%" style="width: 40vw; border-radius: 40px; overflow: hidden; box-shadow: 0px 7px 22px 0px rgba(0, 0, 0, .1);">
                <tr>
                    <p>${user.name}，您好</p>
                    <p>以下為您的驗證碼，請於平台輸入此號碼</p>
                    <p>驗證成功後，即可設定您的新密碼。</p>
                    <br>
                    <div style="display: block; width: 240px; margin: 30px auto; background-color: #ddd; border-radius: 40px; padding: 20px; text-align: center; font-size: 36px; font-family: $font-title; letter-spacing: 10px; box-shadow: 0px 7px 22px 0px rgba(0, 0, 0, .1);">
                        <span style="font-size: 20px; text-align: center; color: #343434; margin-top: 0;">
                            ${verification}
                        </span>
                    </div>
                </tr>
            </table>
        </html>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        return new Promise((resolve, reject) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info.response);
            }
        });
    })
    .then(() => {
        successHandle(res, [], '已寄送驗證碼至使用者 Email');
    })
    .catch(() => {
        next(appError(400, '出現錯誤，請重新申請驗證碼或請恰系統管理員'));
    });
};

module.exports = sendEmail;
