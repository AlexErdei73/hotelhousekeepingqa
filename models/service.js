const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    room: {
        type: mongoose.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room must be specified'],
    },
    date: {
        type: Date,
        required: [true, 'Service date is required'],
    },
    cleaner: {
        type: mongoose.Types.ObjectId,
        ref: 'Cleaner',
        required: [true, 'Cleaner needs to be specified']
    },
    type: {
        type: String,
        enum: ["stay over","depart","linen change","no service","DND"],
        required: [true, 'Job type needs to be specified']
    },
    audit_score: {
        type: Number,
        min: [0, "Audit score is a nonnegative percentage value"],
        max: [100, "Audit value cannor be higher than 100 percent"]
    }
});

module.exports = mongoose.model("Service", ServiceSchema);