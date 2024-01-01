const mongoose = require('mongoose')

const fitbotSchema = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: [true, "please enter your post_id"]
        },
        date: {
            type: String,
            required: [true, "please enter the user_id"]
        }
    }
)

const Fitbot = mongoose.model('fitbots',fitbotSchema);

module.exports = Fitbot;

