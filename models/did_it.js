const mongoose = require('mongoose')

const did_itSchema = mongoose.Schema(
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

const did_it = mongoose.model('did_it', did_itSchema);

module.exports = did_it;

