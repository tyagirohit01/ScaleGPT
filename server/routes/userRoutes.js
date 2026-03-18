import express from "express";
import {
  registerUser, loginUser, logoutUser,
  getUser, getPublishedImages,
  verifyEmail, forgotPassword, resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middlewares/Auth.js";

const userRouter = express.Router();

userRouter.post('/register',         registerUser);
userRouter.post('/login',            loginUser);
userRouter.post('/logout',           logoutUser);
userRouter.get('/data',    protect,  getUser);
userRouter.get('/verify-email',      verifyEmail);
userRouter.post('/forgot-password',  forgotPassword);
userRouter.post('/reset-password',   resetPassword);
userRouter.get('/published-images',  getPublishedImages);

export default userRouter;