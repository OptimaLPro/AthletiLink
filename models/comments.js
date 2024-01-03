
/**
 * Represents the schema for comments in the AthletiLink application.
 * @typedef {Object} commentsSchema
 * @property {string} post_id - The ID of the post the comment belongs to.
 * @property {string} user_id - The ID of the user who made the comment.
 * @property {string} first_name - The first name of the user who made the comment.
 * @property {string} last_name - The last name of the user who made the comment.
 * @property {string} description - The description of the comment.
 * @property {string} date - The date the comment was made.
 * @property {string} time - The time the comment was made.
 */
const mongoose = require('mongoose')

const commentsSchema = mongoose.Schema(
    {
        post_id: {
            type: String,
            required: [true, "please enter post_id"]
        },
        user_id: {
            type: String,
            required: [true, "please enter user_id"]
        },
        first_name: {
            type: String,
            required: [true, "please enter your first_name"]
        },
        last_name: {
            type: String,
            required: [true, "please enter last_name"]
        },
        description: {
            type: String,
            required: [true, "please enter description"]
        },
        date: {
            type: String,
            required: [true, "please enter date"]
        },
        time: {
            type: String,
            required: [true, "please enter time"]
        }
    }
)

const Comments = mongoose.model('comments', commentsSchema);

module.exports = Comments;


