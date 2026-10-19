import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})

export const Class = mongoose.models.Class || mongoose.model("Class", classSchema)