import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email, name, otp) => {
  await resend.emails.send({
    from:    'ScaleGPT <onboarding@resend.dev>',
    to:      email,
    subject: 'Your ScaleGPT verification code',
    html: `
      <div style="font-family:'Outfit',sans-serif;background:#06060e;color:#f0f0ff;padding:40px;border-radius:16px;max-width:480px;margin:auto;">
        <h1 style="font-size:32px;font-weight:900;background:linear-gradient(135deg,#ffffff,#c9a8ff,#f067a6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">scale</h1>
        <p style="color:#9090b0;margin-bottom:24px;">Hi ${name}, welcome to ScaleGPT!</p>
        <p style="color:#f0f0ff;margin-bottom:20px;">Your verification code is:</p>
        <div style="background:#13131f;border:1px solid rgba(163,112,247,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:20px;">
          <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#a370f7;">${otp}</span>
        </div>
        <p style="color:#5a5a7a;font-size:11px;">This code expires in 10 minutes. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from:    'ScaleGPT <onboarding@resend.dev>',
    to:      email,
    subject: 'Reset your ScaleGPT password',
    html: `
      <div style="font-family:'Outfit',sans-serif;background:#06060e;color:#f0f0ff;padding:40px;border-radius:16px;max-width:480px;margin:auto;">
        <h1 style="font-size:32px;font-weight:900;background:linear-gradient(135deg,#ffffff,#c9a8ff,#f067a6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">scale</h1>
        <p style="color:#9090b0;margin-bottom:24px;">Hi ${name},</p>
        <p style="color:#f0f0ff;margin-bottom:20px;">We received a request to reset your password. Click below to set a new one.</p>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7b5ea7,#f067a6);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Reset Password →</a>
        <p style="color:#5a5a7a;font-size:11px;margin-top:24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};