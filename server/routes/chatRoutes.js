import express from "express";
import {
  aiChat, createChat, deleteChat,
  getChats, renameChat,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/Auth.js";

const chatRouter = express.Router();

chatRouter.post('/create',       protect, createChat);
chatRouter.get('/get',           protect, getChats);
chatRouter.post('/ai',           protect, aiChat);
chatRouter.delete('/delete/:id', protect, deleteChat);  // ← protect is here
chatRouter.put('/rename/:id',    protect, renameChat);

export default chatRouter;