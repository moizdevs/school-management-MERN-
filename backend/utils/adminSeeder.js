import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs";


export const seedAdmin = async() => {
    try {
        const adminExists = await User.findOne({
            email: process.env.ADMIN_EMAIL
        }); 

        if(adminExists){
            console.log("Admin already exists"); 
            return;
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)

        // Create admin
        await User.create({
            name: "ADMIN",
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin"
        })
        console.log("Admin created successfully");
        

    } catch (error) {
        console.log("An error occurred while creating admin", error);
        
    }
}