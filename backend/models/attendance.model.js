import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
        required: true
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
    status: {
        type: String,
        enum: ["present", "absent", "leave"],
        default: "present"
    },
    remarks: {
        type: String
    },
    attendanceDate: {
        type: String,
        default: new Date().toISOString().split("T")[0]
    }
}, { timestamps: true });

// Prevent Duplicate Attendance
attendanceSchema.index(
    {
        student: 1,
        subject: 1,
        attendanceDate: 1
    },
    {
        unique: true
    }
)

export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema)