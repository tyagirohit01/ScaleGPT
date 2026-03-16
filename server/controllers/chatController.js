import Chat from "../models/Chat.js";
import mongoose from "mongoose";

// ── Smart title generator ──
function generateSmartTitle(prompt) {
  const text = prompt.trim();

  if (text.length <= 40) return text;

  const fillers = new Set([
    "can", "you", "please", "help", "me", "with", "i", "want", "to", "how",
    "do", "what", "is", "are", "the", "a", "an", "tell", "explain", "write",
    "make", "create", "give", "show", "my", "we", "our", "need", "should",
    "would", "could", "will", "for", "of", "in", "on", "at", "about", "get",
    "just", "also", "using", "use", "let", "know", "like", "some", "good",
    "best", "new", "build", "generate", "fix", "find", "add", "update", "check",
  ]);

  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !fillers.has(w.toLowerCase()));

  if (words.length === 0) {
    return text.split(" ").slice(0, 5).join(" ");
  }

  const title = words.slice(0, 5).join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.create({
      userId,
      emailId: req.user.email,
      messages: [],
      name: "New chat",
      userName: req.user.name,
    });
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID" });
    }

    const chat = await Chat.findOne({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    await Chat.deleteOne({ _id: id });
    res.json({ success: true, message: "Chat deleted successfully", chatId: id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const renameChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const chat = await Chat.findOne({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    chat.name = name.trim();
    await chat.save();
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const aiChat = async (req, res) => {
  try {
    const { prompt, chatId } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    let chat;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      chat = await Chat.create({
        userId:   req.user._id,
        emailId:  req.user.email,
        userName: req.user.name,
        name:     generateSmartTitle(prompt),
        messages: [],
      });
    } else {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }
    }

    // ensure messages is always an array
    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    // auto-rename on first message if still default
    if (
      chat.messages.length === 0 &&
      (!chat.name || chat.name === "New chat" || chat.name === "New Chat")
    ) {
      chat.name = generateSmartTitle(prompt);
    }

    chat.messages.push({
      role:      "user",
      content:   prompt,
      timestamp: Date.now(),
      isImage:   false,
    });

    // ── replace with real AI call ──
    const aiReply = `Mock reply for: "${prompt}"`;

    chat.messages.push({
      role:      "assistant",
      content:   aiReply,
      timestamp: Date.now(),
      isImage:   false,
    });

    await chat.save();

    res.json({
      success:  true,
      message:  aiReply,
      chatId:   chat._id,
      chatName: chat.name,
    });

  } catch (error) {
    console.error("AI error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};