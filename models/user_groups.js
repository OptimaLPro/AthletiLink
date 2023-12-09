const { Int32 } = require('mongodb');
const mongoose = require('mongoose')

const user_goups_Schema = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: [true, "please enter your first name"]
        },
        group: {
            type: String,
            required: [true, "please enter your last name"]
        }
    }
)

const User_groups = mongoose.model('user_groups', user_goups_Schema);

module.exports = User_groups;


