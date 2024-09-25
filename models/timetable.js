const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
    day: String,
    time: String,
    subject: String,
});

const timetableSchema = new mongoose.Schema({
    class: {
        type: String,
        required: true,
        unique: true,
    },
    slots: [timeSlotSchema],
});

module.exports = mongoose.model("Timetable", timetableSchema);
