const mongoose = require('mongoose')

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


