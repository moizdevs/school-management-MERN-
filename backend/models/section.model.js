import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    }

}, { timestamps: true });

export const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);