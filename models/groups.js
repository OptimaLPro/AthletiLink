
/**
 * @typedef {Object} GroupsSchema
 * @property {string} group_name - The name of the group.
 * @property {string} pic - The URL of the group's picture.
 * @property {string} status - The status of the group.
 */

/**
 * Represents the schema for groups in the database.
 * @type {import('mongoose').Schema<GroupsSchema>}
 */
const mongoose = require('mongoose')

const groupsSchema = mongoose.Schema({
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
});

const Groups = mongoose.model('groups', groupsSchema);

module.exports = Groups;


