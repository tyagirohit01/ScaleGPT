import express from "express";
import {
  registerUser, loginUser, logoutUser,
  getUser, getPublishedImages,
  verifyOTP, forgotPassword, resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middlewares/Auth.js";
import { getSettings, saveSettings } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post('/register',        registerUser);
userRouter.post('/login',           loginUser);
userRouter.post('/logout',          logoutUser);
userRouter.get('/data',   protect,  getUser);
userRouter.post('/verify-otp',      verifyOTP);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password',  resetPassword);
userRouter.get('/published-images', getPublishedImages);
userRouter.get('/settings',  protect, getSettings);
userRouter.post('/settings', protect, saveSettings);

export default userRouter;