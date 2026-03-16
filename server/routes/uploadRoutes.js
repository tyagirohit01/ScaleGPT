import express from "express";
import { upload } from "../middlewares/upload.js";
import { protect } from "../middlewares/Auth.js";
import path from "path";

const uploadRouter = express.Router();

uploadRouter.post("/file", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      success:  true,
      url:      fileUrl,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size:     req.file.size,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default uploadRouter;