import bcrypt from "bcrypt";
import crypto from "crypto";
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ── REGISTER — sends OTP ──
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists && exists.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // ✅ Generate 6 digit OTP
    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (exists && !exists.isVerified) {
      // ✅ User exists but not verified — update OTP and resend
      exists.otp       = otp;
      exists.otpExpiry = otpExpiry;
      exists.name      = name;
      exists.password  = password;
      await exists.save();
      await sendOTPEmail(normalizedEmail, name, otp);
      return res.status(200).json({
        success: true,
        message: "OTP resent! Please check your email.",
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendOTPEmail(normalizedEmail, name, otp);

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to continue.",
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ── VERIFY OTP ──
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: "OTP expired. Please register again." });
    }

    user.isVerified = true;
    user.otp        = undefined;
    user.otpExpiry  = undefined;
    await user.save();

    // ✅ Auto login after verification
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    return res.json({
      success: true,
      message: "Email verified successfully!",
      token,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ── LOGIN ──
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: normalizedEmail,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    return res.status(200).json({ success: true, message: "User logged in", token });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ── FORGOT PASSWORD ──
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.json({ success: true, message: "If this email exists, a reset link has been sent." });
    }

    const resetToken       = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetToken       = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.json({ success: true, message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ── RESET PASSWORD ──
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
    }

    user.password         = password;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully! You can now log in." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ── LOGOUT ──
export const logoutUser = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  return res.status(200).json({ success: true, message: "User logged out successfully" });
};

// ── GET USER ──
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ success: true, user, chats: [] });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getPublishedImages = async (req, res) => {
  try {
    const publishedImageMessages = await Chat.aggregate([
      { $unwind: "$messages" },
      { $match: { "messages.isImage": true, "messages.isPublished": true } },
      { $project: { id: 0, imageUrl: "$messages.content", userName: "$userName" } }
    ]);
    res.json({ success: true, images: publishedImageMessages.reverse() });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};