import express from "express"
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import {
    createAssignment,
    getAllAssignments,
    getStudentAssignments,
    deleteAssignment
} from "../controllers/assignment.controller.js";
import upload from "../middleware/multer.js"

const router = express.Router();

router.post("/", protect, authorizeRole("teacher", "admin"), upload.single("file"), createAssignment);
router.get("/", protect, authorizeRole("teacher", "admin"), getAllAssignments);
router.get("/student", protect, authorizeRole("student"), getStudentAssignments);
router.delete("/:id", protect, authorizeRole("teacher", "admin"), deleteAssignment);

export default router;
