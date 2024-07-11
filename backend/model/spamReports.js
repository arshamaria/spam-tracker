const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const types = ['SMS', 'Call'];

const spamReportsSchema = new Schema({
    type: { type: String, enum: types, required: true },
    phone_number: { type: String, required: true },
    message: { type: String, default: null },
    call_info: { type: String, default: null },
    call_duration: { type: Number, default: null },
    device_id: { type: String, required: true }, 
    report_time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpamReport', spamReportsSchema);
module.exports = mongoose.model('SpamReport', spamReportsSchema);
