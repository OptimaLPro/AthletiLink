const mongoose = require('mongoose')

const commentsSchema = mongoose.Schema(
    {
        post_id: {
            type: String,
            required: [true, "please enter post_id"]
        },
        user_id: {
            type: String,
            required: [true, "please enter user_id"]
        },
        first_name: {
            type: String,
            required: [true, "please enter your first_name"]
        },
        last_name: {
            type: String,
            required: [true, "please enter last_name"]
        },
        description: {
            type: String,
            required: [true, "please enter description"]
        },
        date: {
            type: String,
            required: [true, "please enter date"]
        },
        time: {
            type: String,
            required: [true, "please enter time"]
        }
    }
)

const Comments = mongoose.model('comments', commentsSchema);

module.exports = Comments;


