const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, '請輸入您的名字']
        },
        email: {
            type: String,
            required: [true, 'email 為必填欄位'],
            unique: true,
            lowercase: true,
            select: false
        },
        password: {
            type: String,
            required: [true, '尚未設定密碼'],
            select: false
        },
        avatar: {
            type: String,
            default: ''
        },
        sex: {
            type: String,
            enum: ['notKnown', 'male', 'female'],
            default: 'notKnown'
        },
        follow: {
            type: [
                {
                    user: {
                        type: mongoose.Schema.ObjectId,
                        ref: 'user',
                        required: [ true, '使用者資訊未填寫' ],
                    },
                    datetime_update: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        },
        beFollowed: {
            type: [
                {
                    user: {
                        type: mongoose.Schema.ObjectId,
                        ref: 'user',
                        required: [ true, '使用者資訊未填寫' ],
                    },
                    datetime_update: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        },
        createAt: {
            type: Date,
            default: Date.now,
        },
        updateAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        versionKey: false,
    }
);
// User
const User = mongoose.model('user', userSchema);

module.exports = User;