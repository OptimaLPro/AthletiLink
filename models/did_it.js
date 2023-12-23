const mongoose = require('mongoose')

const didSchema = mongoose.Schema(
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

const did_it = mongoose.model('did_its',didSchema);

module.exports = did_it;

