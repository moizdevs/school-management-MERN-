import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import {
    submitAssignment,
    getStudentSubmissions,
    getAssignmentSubmissions,
    reviewSubmission
} from "../controllers/assignmentSubmission.controller.js";
import upload from "../middleware/multer.js";
const router = express.Router();

router.post("/", protect, authorizeRole("student"),upload.single("file"), submitAssignment);
router.get("/my-submissions", protect, authorizeRole("student"), getStudentSubmissions);
router.get("/assignment/:assignmentId", protect, authorizeRole("admin","teacher"), getAssignmentSubmissions);
router.put("/review/:id", protect, authorizeRole("admin","teacher"), reviewSubmission);

export default router;