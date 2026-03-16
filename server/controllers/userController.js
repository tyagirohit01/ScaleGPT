import bcrypt from "bcrypt";
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


// generating token
const generateToken = (id) => {
  return jwt.sign(
    { id },                       //  always store id
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// api to register a user
export const registerUser = async (req, res) => {
    console.log("register hit");
  try {
    const { name, email, password } = req.body; // req.body is the data sent by the client to the server in the body of http request

    // 1 validate the input fields, if any of the below credentials are missing user cannot be registered even if any one is missing
    if(!name || !email || !password){
      return res(400).json({
        success: false,
        message: "all credentials are required"
      })
    }
    // 2️ Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3️ Check if user already exists
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 5️ Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: password,
    });

    // 6️ Generate JWT using MongoDB _id
    const token = generateToken(user._id.toString());

    // 7️ Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to login user
export const loginUser = async (req, res) => {
    const{email, password} = req.body;
    console.log("login request body", req.body)
    try {
        const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      console.log("user from DB", user)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        success: true,
        message: "User logged in",
        token,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  };

 // api to logout a user
 export const logoutUser = (req, res) => {
  res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
  });

  return res.status(200).json({
      success: true,
      message: "User logged out successfully"
  });
};


// API to get user data

export const getUser = async ( req, res ) => {
    try {
        const user = req.user;
        return res.json({success: true, user, chats: []})
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// API to get published images

export const getPublishedImages = async ( req, res ) => {
     try {
         const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            {
                $project: {
                    id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
         ])

         res.json({success: true, images: publishedImageMessages.reverse()})
     } catch (error) {
        return res.json({success: false, message: error.message});
     }
}


