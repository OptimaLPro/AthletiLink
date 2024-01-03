const mongoose = require('mongoose')

/**
 * @typedef {Object} LogsSchema
 * @property {string} timestamp - The timestamp of the log entry.
 * @property {string} user_id - The ID of the user associated with the log entry.
 * @property {string} event_type - The type of event.
 * @property {string} description - The description of the event.
 * @property {string} response - The response received for the event.
 * @property {string} ip_address - The IP address associated with the log entry.
 */
const logsSchema = mongoose.Schema(
    {
        timestamp: {
            type: String,
            required: [true, "please enter timestamp"]
        },
        user_id: {
            type: String,
            required: [true, "please enter the user_id"]
        },
        event_type: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        response: {
            type: String,
            required: false
        },
        ip_address: {
            type: String,
            required: [true, "please enter the ip_address"]
        }
    }
)

const Logs = mongoose.model('logs', logsSchema);

module.exports = Logs;


