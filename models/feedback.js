const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    'room': {
        type: mongoose.Types.ObjectId,
        ref: "Room",
        required: [true, "Room must be specified"]
    },
    'score': {
        type: Number,
        min: [1, "Score cannot be lower than 1"],
        max: [10, "Highest score is 10"],
        required: [true, "Score must be given"]
    },
    'checkin_date': {
        type: Date,
        required: [true, "Checkin date must be specified"]
    },
    'checkout_date': {
        type: Date,
        required: [true, "Chekout date must be specified"]
    },
    'depart_cleaner': {
        type: mongoose.Types.ObjectId,
        ref: "Cleaner"
    },
    'stayover_cleaner': {
        type: mongoose.Types.ObjectId,
        ref: "Cleaner"
    },
    'year': {
        type: Number,
        required: [true, "Year must be given"]
    },
    'month': {
        type: Number,
        min: [1, "Month cannot be less than 1"],
        max: [12, "Month cannot be more than 12"],
        required: [true, "Month has to be specified"]
    }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);