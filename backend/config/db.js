import mongoose from "mongoose";

export async function connectDB() {
    try {
        const uri = process.env.MONGODB_URL;

        console.log("MongoDB URL exists:", !!uri);
        console.log("MongoDB URL starts with mongodb:",
            uri?.startsWith("mongodb://") ||
            uri?.startsWith("mongodb+srv://")
        );

        await mongoose.connect(uri);

        console.log("Connected to database");
    } catch (err) {
        console.log("An error occurred while connecting to database", err);
    }
}