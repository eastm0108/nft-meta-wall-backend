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
    },
    {
        versionKey: false,
    }
);


const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
