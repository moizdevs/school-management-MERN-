import { Assignment } from "../models/assignment.model.js";
import { StudentProfile } from "../models/studentProfile.model.js";
import { TeacherProfile } from "../models/teacherProfile.model.js";
import { v2 as cloudinary } from "cloudinary"

// Create Assignment
export const createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            subjectId,
            classId,
            sectionId,
            dueDate
        } = req.body

        // Find Teacher Profile
        const teacherProfile = await TeacherProfile.findOne({
            user: req.user._id
        });

        if (!teacherProfile) {
            return res.status(400).json({
                success: false,
                message: "Teacher profile not found"
            })
        }
        let attachementData = {};
        // Upload File
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "school-management/assignments",
                resource_type: "auto"
            });
            attachementData = {
                public_id: result.public_id,
                ulr: result.secure_url
            }
        }

        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            class: classId,
            section: sectionId,
            teacher: teacherProfile._id,
            dueDate,
            attachment: attachementData
        })

        res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Get All Assignments
export const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate("subject").populate("class").populate("section").populate({
            path: "teacher",
            populate: {
                path: "user"
            }
        })

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Get Student Assignments 
export const getStudentAssignments = async (req, res) => {
    try {
        const studentProfile = await StudentProfile.findOne({
            user: req.user._id
        })

        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            })
        }

        const assignments = await Assignment.find({
            class: studentProfile.class,
            section: studentProfile.section
        }).populate("subject").populate({
            path: "teacher",
            populate: {
                path: "user"
            }
        });

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Delete an assignment 
export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            })
        }

        // Delete attachment file
        if (assignment.attachment?.public_id) {
            await cloudinary.uploader.destroy(assignment.attachment.public_id, {
                resource_type: "auto"
            })
        }

        await assignment.deleteOne();
        res.status(200).json({
            success: true,
            message: "Assignment deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}