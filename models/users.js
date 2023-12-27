const mongoose = require('mongoose')

const usersSchema = mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, "please enter your first name"]
        },
        last_name: {
            type: String,
            required: [true, "please enter your last name"]
        },
        email: {
            type: String,
            required: [true, "please enter your email"]
        },
        password: {
            type: String,
            required: [true, "please enter your password"]
        },
        date: {
            type: String,
            required: [true, "please enter your birthdate"]
        },
        profile_pic: {
            type: String,
            required: [true, "please enter your profile picture"]
        },
        admin: {
            type: String,
            required: [false, "please enter your admin status"]
        },
        secret_phrase: {
            type: String,
            required: [true, "please enter your secret phrase"]
        },
    }
)

const User = mongoose.model('users', usersSchema);

module.exports = User;


