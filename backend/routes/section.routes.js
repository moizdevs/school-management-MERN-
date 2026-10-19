import express from "express"
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { createSection, deleteSection, getSectionsByClass, updateSection } from "../controllers/section.controller.js";

const router = express.Router();

router.post("/create", protect,authorizeRole("admin"),createSection);
router.get("/:classId", protect,authorizeRole("admin"),getSectionsByClass);
router.put("/:id", protect,authorizeRole("admin"),updateSection);
router.delete("/:id", protect,authorizeRole("admin"),deleteSection);

export default router;