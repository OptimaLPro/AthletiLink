const mongoose = require('mongoose')

const user_goups_Schema = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: [true, "please enter user id"]
        },
        group: {
            type: String,
            required: [true, "please enter group name"]
        }
    }
)

const User_groups = mongoose.model('user_groups', user_goups_Schema);

module.exports = User_groups;


