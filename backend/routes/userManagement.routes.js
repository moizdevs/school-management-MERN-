import express from "express"
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { createStudent, getAllStudents, updateStudent, deleteStudent, createTeacher, getAllTeachers, updateTeacher, deleteTeacher } from "../controllers/userManagement.controller.js";

const router = express.Router();

// Student Routes  
router.post("/student", protect, authorizeRole("admin"), createStudent);
router.get("/students", protect, authorizeRole("admin"), getAllStudents);
router.put("/student/:id", protect, authorizeRole("admin"), updateStudent);
router.delete("/student/:id", protect, authorizeRole("admin"), deleteStudent);

// Teacher Routes  
router.post("/teacher", protect, authorizeRole("admin"), createTeacher);
router.get("/teachers", protect, authorizeRole("admin"), getAllTeachers);
router.put("/teacher/:id", protect, authorizeRole("admin"), updateTeacher);
router.delete("/teacher/:id", protect, authorizeRole("admin"), deleteTeacher);

export default router;