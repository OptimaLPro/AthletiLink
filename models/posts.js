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


