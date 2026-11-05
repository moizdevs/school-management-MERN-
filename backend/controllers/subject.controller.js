import { Subject } from "../models/subject.model.js";
import { Class } from "../models/class.model.js";
import { TeacherProfile } from "../models/teacherProfile.model.js"
import { populate } from "dotenv";

// Create Subject 
export const createSubject = async (req, res) => {
    try {
        const {
            subjectName,
            subjectCode,
            classId,
            teacherId,
            description
        } = req.body;

        if (!subjectName || !subjectCode || !classId) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            })
        }

        if (teacherId) {
            const teacher = await TeacherProfile.findById(teacherId);

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher not found"
                })
            }
        }

        // Check existing subject
        const existingSubject = await Subject.findOne({
            subjectCode
        });

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject code already exists"
            })
        }

        const subject = await Subject.create({
            subjectName,
            subjectCode,
            class: classId,
            teacher: teacherId,
            description
        })

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get All Subjects
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate("class").populate({
            path: "teacher",
            populate: {
                path: "user"
            }
        })

        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Update A Subject
export const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully ",
            subject
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Delete a Subject
export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            })
        }
 
        await subject.deleteOne();
        res.status(200).json({
            success: true,
            message: "Subject deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}