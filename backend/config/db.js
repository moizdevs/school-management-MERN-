import mongoose from "mongoose";

export async function connectDB () {
     try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to database");   
     } catch(err){
        console.log("An error occured while connecting to database",err);  
     }
}