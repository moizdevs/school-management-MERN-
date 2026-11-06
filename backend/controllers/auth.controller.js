import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { genToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { StudentProfile } from "../models/studentProfile.model.js";
import { TeacherProfile } from "../models/teacherProfile.model.js";

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate Token
    const token = await genToken(user._id);

    // Cookie Options
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // Send Cookie
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login SuccessFull",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: "Logout Successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: true,
        message: "User not found",
      });
    }

    // Reset Token Generation
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing Reset Generated Token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Saving resetToken
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    user.save();

    // Reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
           <div style="font-family: Arial, sans-serif; padding:20px">
                <h2 style="color:#333;">Password Reset Request</h2>
                <p>You requested to reset your password</p>
                <p>Click the button below to reset your password</p>
                <a href="${resetUrl}" style="
                     display: inline-block;
                     padding: 12px 20px;
                     background-color: #4f46e5;
                     color: #fff;
                     text-decoration: none;
                     border-radius: 5px;
                     margin-top: 10px;
                ">Reset Password</a>

                <p style="margin-top:20px;">This link will expire in 15 minutes</p>
                <p>If you didn't request this, please ignore this email</p>
           </div>
        `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html,
    });
    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset Passsword
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === "student")
      profile = await StudentProfile.findOne({ user: user._id }).select("_id");
    if (user.role === "teacher")
      profile = await TeacherProfile.findOne({ user: user._id }).select("_id");

    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
