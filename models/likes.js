/**
 * Mongoose schema for the likes collection.
 *
 * @typedef {Object} LikesSchema
 * @property {string} post_id - The ID of the post being liked.
 * @property {string} user_id - The ID of the user who liked the post.
 * @property {string} first_name - The first name of the user who liked the post.
 * @property {string} last_name - The last name of the user who liked the post.
 */
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

