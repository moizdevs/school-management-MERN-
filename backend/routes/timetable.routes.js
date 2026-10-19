import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import {
    createTimetableSlot,
    getClassTimetable,
    getStudentTimetable,
    getTeacherTimetable,
    updateTimetableSlot,
    deleteTimetableSlot
} from "../controllers/timetable.controller.js";

const router = express.Router();

router.post("/", protect, authorizeRole("admin"),createTimetableSlot);
router.get("/class/:classId/:sectionId", protect, authorizeRole("admin", "teacher"),getClassTimetable);
router.get("/student", protect, authorizeRole("student"),getStudentTimetable);
router.get("/teacher", protect, authorizeRole("teacher"),getTeacherTimetable);
router.put("/:id", protect, authorizeRole("admin"),updateTimetableSlot);
router.delete("/:id", protect, authorizeRole("admin"),deleteTimetableSlot);

export default router;