import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { addResult, getStudentResults } from "../controllers/result.controller.js";

const router = express.Router();

router.post("/", protect, authorizeRole("teacher", "admin"), addResult);
router.get("/:studentId", protect, authorizeRole("admin", "teacher", "student"), getStudentResults);

export default router;