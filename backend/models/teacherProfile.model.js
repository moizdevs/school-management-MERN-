import mongoose from "mongoose";

const teacherProfileSchema = new mongoose.Schema({
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
     },
     qualification: {
        type: String
     },
     experience: {
        type: Number
     },
     salary: {
        type: Number
     },
     subjectsSpecialization : {
        type: String
     },
     joiningDate: {
        type: Date,
        default: Date.now
     },
     phone: {
        type: String,
     },
     gender: {
        type: String, 
        enum: ["male", "female"]
     },
     address: {
        type: String
     }
},{timestamps: true});

export const TeacherProfile = mongoose.models.TeacherProfile || mongoose.model("TeacherProfile", teacherProfileSchema);