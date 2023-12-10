const mongoose = require('mongoose')

const groupsSchema = mongoose.Schema(
    {
        group_name: {
            type: String,
            required: [true, "please enter your group name"]
        },
        pic: {
            type: String,
            required: [true, "please enter the group pic"]
        },
        status: {
            type: String,
            required: [true, "please enter the status"]
        }
    }
)

const Groups = mongoose.model('groups', groupsSchema);

module.exports = Groups;


