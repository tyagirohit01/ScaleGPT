import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from "express-rate-limit";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import usageTracker from "./middlewares/usageTracker.js";
import UsageLog from "./models/usageLog.js";
import { protect } from "./middlewares/Auth.js";
import uploadRouter from "./routes/uploadRoutes.js";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();
const app = express();

await connectDB();

// ── RATE LIMITERS ──

// global — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests, slow down!" }
});

// login — prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many login attempts, try again later!" }
});

// register — prevent spam accounts
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: "Too many accounts created, try again later!" }
});

// AI — most expensive route
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: "AI rate limit reached, wait a minute!" }
});

// chat creation — prevent spam
const chatCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: "Too many chats created, slow down!" }
});

// chat delete — prevent abuse
const chatDeleteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: "Too many deletes, slow down!" }
});

// admin — protect dashboard
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: "Too many admin requests!" }
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── APPLY LIMITERS ──
app.use(globalLimiter);
app.use('/api/user/login', loginLimiter);
app.use('/api/user/register', registerLimiter);
app.use('/api/chat/ai', aiLimiter);
app.use('/api/chat/create', chatCreateLimiter);
app.use('/api/chat/delete', chatDeleteLimiter);
app.use('/api/admin', adminLimiter);

app.use(usageTracker);

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get('/', (req, res) => res.send("Server is live"));
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use("/api/upload", uploadRouter);

app.get('/api/admin/dashboard', protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const stats = await UsageLog.aggregate([
      {
        $facet: {
          userStats: [
            { $group: { _id: "$user_id", total_requests: { $sum: 1 }, total_chats: { $sum: { $cond: ["$chat_created", 1, 0] } }, total_messages: { $sum: { $cond: ["$message_sent", 1, 0] } }, last_seen: { $max: "$created_at" } } },
            { $sort: { total_requests: -1 } }
          ],
          dailyStats: [
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, requests: { $sum: 1 }, chats: { $sum: { $cond: ["$chat_created", 1, 0] } }, messages: { $sum: { $cond: ["$message_sent", 1, 0] } } } },
            { $sort: { _id: 1 } }
          ],
          routeStats: [
            { $group: { _id: "$route", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 6 }
          ],
          totals: [
            { $group: { _id: null, total_requests: { $sum: 1 }, total_chats: { $sum: { $cond: ["$chat_created", 1, 0] } }, total_messages: { $sum: { $cond: ["$message_sent", 1, 0] } }, unique_users: { $addToSet: "$user_id" } } },
            { $project: { total_requests: 1, total_chats: 1, total_messages: 1, unique_users: { $size: "$unique_users" } } }
          ]
        }
      }
    ]);
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server started on port ${PORT}`));