import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true
    },
    day: {
        type: String,
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            'Saturday'
        ],
        required: true
    },
    periodNumber: {
        type: Number,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeacherProfile",
        required: true
    },
}, { timestamps: true });

// Prevent Duplicate Period 
timetableSchema.index({
    class: 1,
    section: 1,
    day: 1,
    peroidNumber: 1
}, { unique: true })

export const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);