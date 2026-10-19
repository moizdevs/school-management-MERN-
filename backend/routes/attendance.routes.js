import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import {
    markAttendance,
    getAttendanceByClass,
    getStudentAttendance,
    getAttendanceStats
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", protect, authorizeRole("teacher", "admin"), markAttendance);
router.get("/class/:classId", protect, authorizeRole("teacher", "admin"), getAttendanceByClass);
router.get("/student/:studentId", protect, authorizeRole("teacher", "admin", "student"), getStudentAttendance);
router.get("/stats/:studentId", protect, authorizeRole("teacher", "admin", "student"), getAttendanceStats);


export default router;