import { Attendance } from "../models/attendance.model.js";
import { TeacherProfile } from "../models/teacherProfile.model.js";


// Mark Attendance 
export const markAttendance = async (req, res) => {
    try {
        const {
            classId,
            sectionId,
            subjectId,
            attendanceData
        } = req.body;

        if (!classId || !sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            })
        }

        // Teacher ID 
        const teacherProfile = await TeacherProfile.findOne({
            user: req.user._id
        })

        if (!teacherProfile) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            })
        }

        // Save Attendance
        const attendanceRecords = [];

        for (const data of attendanceData) {
            const attendance = await Attendance.create({
                student: data.studentId,
                class: classId,
                section: sectionId,
                subject: subjectId,
                teacher: teacherProfile._id,
                status: data.status,
                remarks: data.remarks || ""
            })

            attendanceRecords.push(attendance)
        }
        res.status(201).json({
            success: true,
            message: "Attendace marked successfully",
            attendanceRecords
        })
    } catch (error) {
        // Duplicate Attendance Error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for today"
            })
        }
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get Attendance by Class
export const getAttendanceByClass = async (req, res) => {
    try {
        const attendance = await Attendance.find({ class: req.params.classId }).populate({
            path: "student",
            populate: {
                path: "user"
            }
        }).populate("subject").populate("section");

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Student Attendance Report 
export const getStudentAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.params.studentId }).populate("subject").populate("class").populate("section");

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get Attendance Stats
export const getAttendanceStats = async (req, res) => {
    try {
        const totalAttendance = await Attendance.countDocuments({
            student: req.params.studentId
        });
        const presentAttendance = await Attendance.countDocuments({
            student: req.params.studentId,
            status: "present"
        });
        const abesentAttendance = await Attendance.countDocuments({
            student: req.params.studentId,
            status: "absent"
        });

        const percentage = ((presentAttendance / totalAttendance) * 100).toFixed(2);

        res.status(200).json({
            success: true,
            totalAttendance,
            presentAttendance,
            abesentAttendance,
            percentage
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

