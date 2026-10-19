import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
        required: true
    },
    submissionText: {
        type: String
    },
    attachment: {
        public_id: String,
        url: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["submitted", "reviewed"],
        default: "submitted"
    },
    teacherRemarks: {
        type: String
    },
    marksAwarded: {
        type: Number
    }
}, { timestamps: true });

// Prevent Multiple Assignment Submissions 
assignmentSubmissionSchema.index({
    assignment: 1,
    student: 1
}, { unique: true })

export const AssignmentSubmission = mongoose.models.AssignmentSubmission || mongoose.model("AssignmentSubmission", assignmentSubmissionSchema)