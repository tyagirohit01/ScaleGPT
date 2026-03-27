import UsageLog from "../models/usageLog.js";

export default function usageTracker(req, res, next) {
  next();

  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const route = req.route?.path || req.path;
      const method = req.method;
      const fullPath = req.originalUrl; // ✅ use originalUrl to get full path

      const logData = {
        user_id:       req.user?.id || 'anonymous',
        method:        method,
        route:         fullPath,
        status_code:   res.statusCode,
        response_time: Date.now() - startTime,
        ip_address:    req.ip,
        // ✅ updated to match your exact routes
        chat_created:  method === 'POST' && fullPath.includes('/api/chat'),
        message_sent:  method === 'POST' && (fullPath.includes('/api/message/text') || fullPath.includes('/api/message/image')),
      };

      console.log(`[${logData.method}] ${logData.route} → ${logData.status_code} (${logData.response_time}ms) user: ${logData.user_id}`);

      await UsageLog.create(logData);

    } catch (err) {
      console.error('[UsageTracker]', err.message);
    }
  });
}