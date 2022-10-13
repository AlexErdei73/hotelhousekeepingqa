const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CleanerSchema = new Schema({
    first_name: {
        type: String,
        required: [true, "Cleaner needs to have first name."]
    },
    last_name: String,
    start_date: Date,
    finish_date: Date,
    active: {
        type: Boolean,
        required: [true, "Cleaner's active status needs to be given."]
    }
});

CleanerSchema.virtual("name").get(function() {
    return `${this.first_name.trim()} ${this.last_name.trim()}`;
})

CleanerSchema.virtual("url").get(function() {
    return `/hotel/cleaner/${this._id}`;
});

CleanerSchema.virtual("name_id").get(function() {
    return `${this.first_name.trim().toLowerCase()},${this.last_name.trim().charAt(0).toLowerCase()}`;
});

module.exports = mongoose.model("Cleaner", CleanerSchema);

