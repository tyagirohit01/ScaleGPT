import Chat from "../models/Chat.js";
import User from "../models/User.js";

// Text Generation Message Controller
export const textMessageController = async (req, res) => {
    console.log("📨 message controller hit", req.body);
    try {
        const userId = req.user._id;

        // check credits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "you dont have enough credits" })
        }
       
        const { chatId, prompt } = req.body;

        // find chat
        const chat = await Chat.findOne({ userId, _id: chatId })
        
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" })
        }

        // push user message
        chat.messages.push({ 
            role: "user", 
            content: prompt, 
            timestamp: Date.now(), 
            isImage: false 
        });

        // ✅ mock AI reply for now
        const reply = { 
            role: "assistant",
            content: `Mock AI reply: "${prompt}"`,
            timestamp: Date.now(), 
            isImage: false 
        }

        chat.messages.push(reply)
        await chat.save();
        
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })

        res.json({ success: true, reply })
      
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}