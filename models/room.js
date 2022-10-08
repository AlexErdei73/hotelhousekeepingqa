const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    number: {
        type: Number,
        min: [1, "Roomnumber should be at least 1"],
        max: [9999, "Roomnumber cannot be 5 digits"],
        required: [true, "Room should have a number"]
    },
    page: {
        type: Number,
        min: [1, "Page should be at least 1"],
        max: [99, "Page cannot be 3 digits"],
        required: [true, "Room should be on a page"]
    },
    type: String
});

module.export = mongoose.model("Room", RoomSchema);