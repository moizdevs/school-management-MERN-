import express from "express"
import { forgotPassword, getMe, loginUser, logoutUser, resetPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { loginLimiter, forgetPasswordLimiter } from "../middleware/login.middleware.js";

const router = express.Router();

router.post("/login",loginLimiter, loginUser)
router.get("/logout", logoutUser)
router.post("/forgot-password",forgetPasswordLimiter, forgotPassword)
router.patch("/reset-password/:token", resetPassword)
router.get("/me", protect, getMe)


export default router;