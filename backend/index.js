import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import morgan from "morgan"
import helmet from "helmet"
import { connectDB } from "./config/db.js"
import { seedAdmin } from "./utils/adminSeeder.js"
import authRoutes from "./routes/auth.routes.js"
import statsRoutes from "./routes/stats.routes.js"
import classRoutes from "./routes/class.routes.js"
import sectionRoutes from "./routes/section.routes.js"
import userManagementRoutes from "./routes/userManagement.routes.js"
import subjectRoutes from "./routes/subject.routes.js"
import attendanceRoutes from "./routes/attendance.routes.js"
import examRoutes from "./routes/exam.routes.js"
import resultRoutes from "./routes/result.routes.js"
import assignmentRoutes from "./routes/assignment.routes.js"
import assignmentSubmissionRoutes from "./routes/assignmentSubmission.routes.js"
import timetableRoutes from "./routes/timetable.routes.js"
import { connectCloudinary } from "./config/cloudinary.js"

dotenv.config();
// App initialization
const app = express();

// Database Connection
connectDB();
// Cloudinary Connection
connectCloudinary();

// Seed Admin 
seedAdmin()

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));

app.use(helmet());
app.use(morgan("dev"));

app.get("/",(req, res)=>{
    res.status(200).json({
        success: true,
        message: "Server is running..."
    })
});

app.use("/api/auth", authRoutes)
app.use("/api/class", classRoutes)
app.use("/api/section", sectionRoutes)
app.use("/api/user-management", userManagementRoutes)
app.use("/api/subject", subjectRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/exams", examRoutes)
app.use("/api/results", resultRoutes)
app.use("/api/assignments", assignmentRoutes)
app.use("/api/submissions", assignmentSubmissionRoutes)
app.use("/api/timetable", timetableRoutes)
app.use("/api/stats", statsRoutes)
const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
});