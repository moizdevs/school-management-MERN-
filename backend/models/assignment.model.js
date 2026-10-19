import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
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
    dueDate: {
        type: Date
    },
    attachmentDate: {
        public_id: String,
        url: String
    }
}, { timestamps: true });

export const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema)