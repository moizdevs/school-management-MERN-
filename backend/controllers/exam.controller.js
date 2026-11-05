import { Exam } from "../models/exam.model.js"

// Create Exam
export const createExam = async (req, res) => {
    try {
        const {
            examName,
            classId,
            sectionId,
            subjectId,
            examDate,
            totalMarks,
            passingMarks,
            description
        } = req.body;

        const exam = await Exam.create({
            examName,
            class: classId,
            section: sectionId,
            subject: subjectId,
            examDate,
            totalMarks,
            passingMarks,
            description
        });

        res.status(201).json({
            success: true,
            message: "Exam created successfully",
            exam
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get All Exams
export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate("class").populate("section").populate("subject");

        res.status(200).json({
            success: true,
            count: exams.length,
            exams
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Delete Exam
export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if(!exam){
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            })
        }

        await exam.deleteOne();
        res.status(200).json({
            success: true,
            message: "Exam deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}