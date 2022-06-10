const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: [true, "使用者資訊未填寫"],
        },
        comment: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        post: {
            type: mongoose.Schema.ObjectId,
            ref: 'posts',
            require: ['true', 'comment must belong to a post.'],
        },
    },
    {
        versionKey: false,
    }
);

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'id name avatar',
    });

    next();
});


const comment = mongoose.model('comment', commentSchema);

module.exports = comment;
