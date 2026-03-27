import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role:      { type: String, required: true },
    content:   { type: String, default: "" },      // ← remove required, add default
    isImage:   { type: Boolean, default: false },   // ← remove required, add default
    timestamp: { type: Number, default: Date.now }, // ← add default
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emailId:  { type: String, required: true },
    userName: { type: String, required: true },
    name:     { type: String, default: "New chat" },
    mode: {
      type: String,
      enum: ["chat", "image", "code", "project", "video", "music"],
      default: "chat",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;