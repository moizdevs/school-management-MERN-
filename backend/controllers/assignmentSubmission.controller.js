import { AssignmentSubmission } from "../models/assignmentSubmission.model.js";
import { Assignment } from "../models/assignment.model.js";
import { StudentProfile } from "../models/studentProfile.model.js";
import { v2 as cloudinary } from "cloudinary";

// Submit Assignment
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, submissionText } = req.body;

        // Find Student Profile
        const studentProfile = await StudentProfile.findOne({
            user: req.user._id
        });

        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            })
        }

        // Check Assignment 
        const assignment = await Assignment.finById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            })
        }

        let attachmentData = {};
        // Upload File 
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "school-management/submissions",
                resource_type: "auto"
            });

            attachmentData = {
                public_id: result.public_id,
                url: result.secure_url
            }
        }

        // Create Submission 
        const submission = await AssignmentSubmission.create({
            assignment: assignmentId,
            student: studentProfile._id,
            submissionText,
            attachment: attachmentData
        });

        res.status(201).json({
            success: true,
            message: "Assignment submitted successfully",
            submission
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Get Student Submissions
export const getStudentSubmissions = async (req, res) => {
    try {
        const studentProfile = await StudentProfile.findOne({
            user: req.user._id
        });

        const submissions = await AssignmentSubmission.find({ student: studentProfile._id }).populate("assignment");

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}


// Get Assignment Submissons 
export const getAssignmentSubmissions = async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find({
            assignment: req.params.assignmentId
        }).populate({
            path: "student",
            populate: {
                path: "user"
            }
        });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Review Submission 
export const reviewSubmission = async (req,res) => {
    try {
        const { teacherRemarks, marksAwarded, status } = req.body;

        const submission = AssignmentSubmission.findByIdAndUpdate(req.params.id, {
            teacherRemarks,
            marksAwarded,
            status
        }, {new : true});

        if(!submission){
            return res.status(404).json({
            success: false,
            message: "Submission not found"
        })
        }
        res.status(200).json({
            success: true,
            message: "Submission reviewed successfully",
            submission
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}