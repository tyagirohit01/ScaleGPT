import mongoose from 'mongoose';

export const usageLogSchema = new mongoose.Schema({
  user_id:       { type: String, default: 'anonymous' },
  method:        { type: String, required: true },
  route:         { type: String, required: true },
  status_code:   { type: Number },
  response_time: { type: Number },
  ip_address:    { type: String },
  // ✅ new fields
  chat_created:  { type: Boolean, default: false },  // true when new chat is created
  message_sent:  { type: Boolean, default: false },  // true when message is sent
  created_at:    { type: Date, default: Date.now },
});

export default mongoose.model('UsageLog', usageLogSchema);