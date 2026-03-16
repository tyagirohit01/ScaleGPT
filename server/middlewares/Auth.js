import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  console.log("🔐 AUTH MIDDLEWARE RUNS");
  // front end sends token to backend and that token is not like euresirehtihgs this its like Authorization: Bearer erjeksjrkeserksesj
  // the server extracts the headers authorization and store it inside the token to check if it contains the jwt token, if not
  // then we will go back to our login page and check if the localStorage.setItem("token", req.data.token) is working properly or not.
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // to remove "Bearer " from "Bearer erJFEIpfefheisfeaoora" because jwt.verify cannot verify token containing bearer it must receieve only second part.
    token = token.split(" ")[1];
    // after extracting token the middleware verify the token by asking two questions
    // 1) was it signed in using the secret key 2) was it expired? 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if the token is valid we will return the decoded paylod
    console.log("Decoded:", decoded);
    // fetch the user from the database so that deleted users cannot acces the system
    const user = await User.findById(decoded.id);
    console.log("user found: ", user);
    if(!user){
      return res.status(401).json({message: "user not found"});
    }
    // if any user is blocked 
    if(user.isBlocked){
      return res.status(403).json({message: "user is blocked"});
    }
    // and attach the user to request
    req.user = user;
    console.log("🔐 USER:", req.user.email);
    // once the middleware verifies the token and authenticate the user we call next() so that the control can passed on to the controller to perform business logic like creating a chat, getting or deleting it.
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
  }
