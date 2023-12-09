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
        user_first_name: {
            type: String,
            required: [true, "please enter your user_first_name"]
        },
        user_last_name: {
            type: String,
            required: [true, "please enter the user_last_name"]
        }
    }
)

const likes = mongoose.model('likes', likesSchema);

module.exports = likes;

