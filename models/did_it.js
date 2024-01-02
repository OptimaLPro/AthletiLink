/**
 * @typedef {Object} DidSchema
 * @property {string} post_id - The ID of the post.
 * @property {string} user_id - The ID of the user.
 * @property {string} first_name - The first name of the user.
 * @property {string} last_name - The last name of the user.
 */
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

const Did_it = mongoose.model('did_its',didSchema);

module.exports = Did_it;

