import { name } from "nodemailer/lib/package-info.js";
import { StudentProfile } from "../models/studentProfile.model.js";
import { TeacherProfile } from "../models/teacherProfile.model.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Create Student
import mongoose from "mongoose";

export const createStudent = async (req, res) => {
    try {
        const {
            name, email, password, classId, sectionId, rollNumber,
            fatherName, motherName, phone, gender, dob, address, admissionDate,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);   // transaction se bahar

        let user, studentProfile;

        await mongoose.connection.transaction(async (session) => {
            const existingUser = await User.findOne({ email }).session(session);
            if (existingUser) {
                const err = new Error("User already exists");
                err.status = 400;
                throw err;
            }

            [user] = await User.create(
                [{ name, email, password: hashedPassword, role: "student" }],
                { session }
            );

            [studentProfile] = await StudentProfile.create(
                [{
                    user: user._id, class: classId, section: sectionId,
                    rollNumber, fatherName, motherName, phone, gender, dob, address, admissionDate,
                }],
                { session }
            );
        });

        const { password: _pw, ...safeUser } = user.toObject();
        res.status(201).json({ success: true, message: "Student created successfully", user: safeUser, studentProfile });
    } catch (error) {
        const status = error.status || (error.code === 11000 ? 400 : 500);
        res.status(status).json({
            success: false,
            message: error.code === 11000 ? "User already exists" : error.message,
        });
    }
};

// Get all students 
export const getAllStudents = async (req, res) => {
    try {
        const students = await StudentProfile.find().populate("user","-password").populate("class").populate("section");

        res.status(200).json({
            success: true,
            count: students.length,
            students
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Update Student 
export const updateStudent = async (req, res) => {
    try {
        const student = await StudentProfile.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            })
        }

        // Update user 
        await User.findByIdAndUpdate(
            student.user,
            {
                name: req.body.name,
                email: req.body.email
            },
            {
                new: true
            }
        )

        // Update Student Profile
        const updatedStudent = await StudentProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        ).populate("user").populate("class").populate("section");

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            updatedStudent
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Delete Student
export const deleteStudent = async (req, res) => {
    try {
        const student = await StudentProfile.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            })
        }

        // Delete user 
        await User.findByIdAndDelete(student.user);

        await student.deleteOne();
        res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Create Teacher
export const createTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            qualification,
            experience,
            salary,
            subjectSpecialization,
            phone,
            gender,
            address,
            joiningDate,
        } = req.body;

        // Check exisitng user
        const existingTeacher = await User.findOne({ email });

        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "teacher"
        })
        // Create Teacher Profile
        const teacherProfile = await TeacherProfile.create({
            user: user._id,
            qualification,
            experience,
            salary,
            subjectSpecialization,
            phone,
            gender,
            address,
            joiningDate,
        })

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            user,
            teacherProfile,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get All Teachers 
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await TeacherProfile.find().populate("user","-password");

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Update Teacher 
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await TeacherProfile.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            })
        }

        // Update user 
        await User.findByIdAndUpdate(
            teacher.user,
            {
                name: req.body.name,
                email: req.body.email
            },
            {
                new: true
            }
        )

        // Update Teacher Profile
        const updatedTeacher = await TeacherProfile.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        ).populate("user","-password");

        res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            updatedTeacher
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Delete Teacher
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await TeacherProfile.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            })
        }

        // Delete user 
        await User.findByIdAndDelete(teacher.user);

        await teacher.deleteOne();
        res.status(200).json({
            success: true,
            message: "Teacher deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}