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
            type: [String],
            default: []
        },
        comments: {
            type: [
                { 
                    user: { type: mongoose.Schema.ObjectId, ref: 'user' },
                    comment: String,
                    createdAt: { type: Date, default: Date.now },
                }
            ],
            default: [],
        },
    },
    {
        versionKey: false,
    }
);

const posts = mongoose.model('posts', postsSchema);

module.exports = posts;
