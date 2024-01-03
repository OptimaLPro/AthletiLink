/**
 * Represents the schema for the Fitbot model.
 * @typedef {Object} FitbotSchema
 * @property {string} user_id - The ID of the user.
 * @property {string} date - The date of the Fitbot entry.
 */
const mongoose = require('mongoose')

const fitbotSchema = mongoose.Schema(
    {
        user_id: {
            type: String,
            required: [true, "please enter your user_id"]
        },
        date: {
            type: String,
            required: [true, "please enter the date"]
        }
    }
)

const Fitbot = mongoose.model('fitbots',fitbotSchema);

module.exports = Fitbot;

