import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { getAdmissionStats, getClassDistributionStats } from "../controllers/stats.controller.js"
const router = express.Router();

router.get("/admissions", protect, authorizeRole("admin"), getAdmissionStats);
router.get("/class-distribution", protect, authorizeRole("admin"), getClassDistributionStats);

export default router;