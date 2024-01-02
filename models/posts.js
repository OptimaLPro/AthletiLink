/**
 * Represents the schema for a post in the AthletiLink application.
 *
 * @typedef {Object} PostSchema
 * @property {string} user_id - The ID of the user who created the post.
 * @property {string} created - The date and time when the post was created.
 * @property {string} type - The type of the post.
 * @property {string} title - The title of the post.
 * @property {string} pic - The picture associated with the post.
 * @property {string} host - The host of the event associated with the post.
 * @property {string} group_name - The name of the group associated with the post.
 * @property {string} duration - The duration of the event associated with the post.
 * @property {string} location - The location of the event associated with the post.
 * @property {string} description - The description of the post.
 * @property {number} likes - The number of likes the post has received.
 * @property {number} did - The number of times the user has performed the activity associated with the post.
 * @property {number} comments - The number of comments on the post.
 * @property {string} date - The date of the event associated with the post.
 * @property {string} time - The time of the event associated with the post.
 * @property {string} status - The status of the post.
 */
const mongoose = require('mongoose')

const postSchema = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: [true, "please enter your first name"]
        },
        created: {
            type: String,
            required: [true, "please enter created date"]
        },
        type: {
            type: String,
            required: [true, "please enter the type of post"]
        },
        title: {
            type: String,
            required: [true, "please enter your last name"]
        },
        pic: {
            type: String,
            required: [true, "please enter your email"]
        },
        host: {
            type: String,
            required: [true, "please enter your password"]
        },
        group_name: {
            type: String,
            required: [true, "please enter group name"]
        },
        duration: {
            type: String,
            required: [true, "please enter duration"]
        },
        location: {
            type: String,
            required: [true, "please enter location"]
        },
        description: {
            type: String,
            required: [true, "please enter description"]
        },
        likes: {
            type: Number,
            required: [true, "please enter likes count"]
        },
        did: {
            type: Number,
            required: [true, "please enter i did it count"]
        },
        comments: {
            type: Number,
            required: [true, "please enter comments"]
        },
        date: {
            type: String,
            required: [true, "please enter the date"]
        },
        time: {
            type: String,
            required: [true, "please enter the time"]
        },
        status: {
            type: String,
            required: [true, "please enter the status"]
        }
    }
)

const Posts = mongoose.model('posts', postSchema);

module.exports = Posts;


