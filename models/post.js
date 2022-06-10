const mongoose = require('mongoose');
const postsSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: [ true, '使用者資訊未填寫' ],
        },
        tags: [
            {
                type: String,
            },
        ],
        type: {
            type: String,
            enum: [ 'group', 'person' ],
            default: 'person'
        },
        image: {
            type: String,
            default: '',
        },
        createAt: {
            type: Date,
            default: Date.now,
        },
        content: {
            type: String,
            required: [true, 'Content 未填寫'],
        },
        likes: {
            type: [{ type: mongoose.Schema.ObjectId, ref: 'user' }],
            default: []
        },
    },
    {
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// 使用 virtual，怕 comments 超過陣列限制，量多處理
postsSchema.virtual('comments', {
    ref: 'comment',
    foreignField: 'post',
    localField: '_id',
});

const posts = mongoose.model('posts', postsSchema);

module.exports = posts;
