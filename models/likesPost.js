const mongoose = require('mongoose')

const likesPostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: [true, 'User ID 未填寫'],
        },
        posts: {
            type: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'post'
                }
            ],
            default: [],
        },
    },
    { versionKey: false }
)

const LikesPost = mongoose.model('LikesPost', likesPostSchema)

module.exports = LikesPost