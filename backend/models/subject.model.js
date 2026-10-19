import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true,
        unique: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeacherProfile"
    },
    description: {
        type: String
    }
}, { timestamps: true });

export const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema)