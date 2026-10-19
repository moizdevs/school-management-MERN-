import express from "express"
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { createSubject, getAllSubjects, updateSubject, deleteSubject } from "../controllers/subject.controller.js";

const router = express.Router();

router.post("/create", protect, authorizeRole("admin"), createSubject);
router.get("/get", protect, authorizeRole("admin"), getAllSubjects);
router.put("/:id", protect, authorizeRole("admin"), updateSubject);
router.delete("/:id", protect, authorizeRole("admin"), deleteSubject);

export default router;