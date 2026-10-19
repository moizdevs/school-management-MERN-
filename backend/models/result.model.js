import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },
    obtainedMarks: {
        type: Number,
        required: true
    },
    precentage: {
        type: Number
    },
    grade: {
        type: String
    },
    remarks: {
        type: String
    },
    status: {
        type: String,
        enum: ["pass", "fail"]
    }
},{timestamps: true});

// Prevent Duplicate Result 
resultSchema.index({
    student: 1,
    exam: 1
}, {unique: true})

export const Result = mongoose.models.Result || mongoose.model("Result", resultSchema);