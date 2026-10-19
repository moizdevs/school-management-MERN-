import express from "express"
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/role.middleware.js";
import { createClass, deleteClass, getAllClasses, updateClass } from "../controllers/class.controller.js";

const router = express.Router();

router.post("/create", protect,authorizeRole("admin"),createClass);
router.get("/get", protect,authorizeRole("admin"),getAllClasses);
router.put("/:id", protect,authorizeRole("admin"),updateClass);
router.delete("/:id", protect,authorizeRole("admin"),deleteClass);

export default router;