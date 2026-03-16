import  express from "express";
import { getPublishedImages, registerUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/userController.js";
import { getUser } from "../controllers/userController.js";
import { logoutUser } from "../controllers/userController.js";
import { protect } from "../middlewares/Auth.js";


const userRouter = express.Router()

// Register a user 
userRouter.post('/register', registerUser)

// Login a user
userRouter.post('/login', loginUser)

// Logout a user
userRouter.post('/logout', logoutUser)

// Getting a user
userRouter.get('/data', protect,  getUser)

// published images
userRouter.get('/published-images',  getPublishedImages)

export default userRouter;