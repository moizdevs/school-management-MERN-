import { Result } from "../models/result.model.js";
import { Exam } from "../models/exam.model.js";
import { StudentProfile } from "../models/studentProfile.model.js";

// Add Result
export const addResult = async (req, res) => {
    try {
        const {
            studentId,
            examId,
            obtainedMarks,
            remarks
        } = req.body;

        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exams not found"
            })
        }

        // Calculate Percentage 
        const percentage = ((obtainedMarks / exam.totalMarks) * 100).toFixed(2);

        // Pass/Fail 
        const status = obtainedMarks >= exam.passingMarks ? "pass" : "fail";

        // Grade System
        let grade = "F";
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 50) grade = "D";

        const result = await Result.create({
            student: studentId,
            exam: examId,
            obtainedMarks,
            percentage,
            grade,
            remarks,
            status
        })
        res.status(201).json({
            success: true,
            message: "Result added successfully",
            result
        })
    } catch (error) {
        if(error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Result already added"
            })
        }
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get Student Result
export const getStudentResults = async (req,res) => {
    try {
        const results = await Result.find({student: req.params.studentId}).populate("exam");

        res.status(200).json({
            success: true,
            count: results.length,
            results
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}