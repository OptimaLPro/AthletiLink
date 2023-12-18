const mongoose = require('mongoose')

const likesSchema = mongoose.Schema(
    {
        post_id: {
            type: String,
            required: [true, "please enter your post_id"]
        },
        user_id: {
            type: String,
            required: [true, "please enter the user_id"]
        },
        first_name: {
            type: String,
            required: [true, "please enter your user_first_name"]
        },
        last_name: {
            type: String,
            required: [true, "please enter the user_last_name"]
        }
    }
)

const Likes = mongoose.model('likes', likesSchema);

module.exports = Likes;

