import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} is not allowed`
            })
        }
        next();
    }

}