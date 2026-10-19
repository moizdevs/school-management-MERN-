import { Class } from "../models/class.model.js";

// Create a Class
export const createClass = async (req, res) => {
    try {
        const { className } = req.body;

        if (!className) {
            return res.status(400).json({
                success: false,
                message: "Class Name is required",
            });
        }

        const existingClass = await Class.findOne({ className });

        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "Class already exists",
            });
        }

        const newClass = await Class.create({
            className,
        });

        res.status(201).json({
            success: true,
            message: "Class Created Successfully",
            newClass,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all classes
export const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: classes.length,
            classes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update a class 
export const updateClass = async (req, res) => {
    try {
        const academicClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!academicClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Class updated successfully",
            academicClass
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Delete a Class
export const deleteClass = async (req,res) => {
    try {
        const academicClass = await Class.findById(req.params.id);

        if(!academicClass){
            return res.status(404).json({
                success:false,
                message: "Class not found"
            })
        }

        await academicClass.deleteOne();

        res.status(200).json({
            success:true,
            message:"Class deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        })
    }
}