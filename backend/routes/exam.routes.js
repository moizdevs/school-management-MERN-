import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { createExam, getAllExams, deleteExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/", protect, authorizeRole("admin"), createExam);
router.get("/", protect, authorizeRole("admin", "teacher"), getAllExams);
router.delete("/:id", protect, authorizeRole("admin", deleteExam));

export default router;