import { Timetable } from "../models/timetable.model.js";
import { Subject } from "../models/subject.model.js";
import { StudentProfile } from "../models/studentProfile.model.js";
import { TeacherProfile } from "../models/teacherProfile.model.js";

// Create time table slot
export const createTimetableSlot = async (req, res) => {
    try {
        const {
            classId,
            sectionId,
            day,
            startTime,
            endTime,
            periodNumber,
            subjectId,
        } = req.body;

        // Validation
        if (
            !classId ||
            !sectionId ||
            !day ||
            !periodNumber ||
            !startTime ||
            !endTime ||
            !subjectId
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Find Subject
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        // Check duplicate period
        const existingPeriod = await Timetable.findOne({
            class: classId,
            section: sectionId,
            day,
            periodNumber,
        });
        if (existingPeriod) {
            return res.status(400).json({
                success: false,
                message: `Period ${periodNumber} already exists for ${day}`,
            });
        }

        // Check Time Overlap
        const existingslots = await Timetable.find({
            class: classId,
            section: sectionId,
            day,
        });

        const newStart = startTime.replace(":", "");
        const newEnd = endTime.replace(":", "");

        const conflict = existingslots.find((slot) => {
            const slotStart = slot.startTime.replace(":", "");
            const slotEnd = slot.endTime.replace(":", "");

            return newStart < slotEnd && newEnd > slotStart;
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "Time Slot overlaps with existing timtable period",
            });
        }

        // Create Slot
        const timetable = await Timetable.create({
            class: classId,
            section: sectionId,
            day,
            periodNumber,
            startTime,
            endTime,
            subject: subjectId,
            teacher: subject.teacher,
        });
        res.status(201).json({
            success: true,
            message: "Timetable slot created successfully",
            timetable,
        });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: error.messsage,
        });
    }
};

// Get Class Timetable
export const getClassTimetable = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;

        const timetable = await Timetable.find({
            class: classId,
            section: sectionId,
        })
            .populate("subject")
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                },
            })
            .sort({
                day: 1,
                periodNumber: 1,
            });

        res.status(200).json({
            success: true,
            count: timetable.length,
            timetable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage,
        });
    }
};

// Get Student Timetable
export const getStudentTimetable = async (req, res) => {
    try {
        const studentProfile = await StudentProfile.find({
            user: req.user._id,
        });

        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found",
            });
        }

        const timetable = await Timetable.find({
            class: studentProfile.classId,
            section: studentProfile.sectionId,
        })
            .populate("subject")
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                },
            })
            .sort({
                day: 1,
                periodNumber: 1,
            });

        res.status(200).json({
            success: true,
            count: timetable.length,
            timetable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage,
        });
    }
};


// Get Teacher TimeTable 
export const getTeacherTimetable = async (req, res) => {
    try {
        const teacherProfile = await TeacherProfile.findOne({
            user: req.user._id,
        });

        if (!teacherProfile) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found",
            });
        }

        const timetable = await Timetable.find({
            teacher: teacherProfile._id
        }).populate("subject").populate("class").populate("section").sort({
            day: 1,
            periodNumber: 1
        });

        res.status(200).json({
            success: true,
            timetable
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Update Timetable Slot
export const updateTimetableSlot = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Timetable updated successfully",
            timetable
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}

// Delete Timatable Slot
export const deleteTimetableSlot = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found"
            })
        }

        await timetable.deleteOne();
        res.status(200).json({
            success: true,
            message: "Timetable slot deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messsage
        })
    }
}