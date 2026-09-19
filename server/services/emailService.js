import nodemailer from 'nodemailer';

/**
 * SpeechFlow AI Email Delivery Engine
 * Supports:
 * 1. Resend API (RESEND_API_KEY)
 * 2. SendGrid API (SENDGRID_API_KEY)
 * 3. SMTP (Gmail, Brevo, SendGrid SMTP, Mailgun, Amazon SES, or custom SMTP)
 * 4. Nodemailer Ethereal Sandbox (Auto-generated test SMTP for instant testing)
 */

function generateEmailTemplate({ otp, appName = 'SpeechFlow AI', expirationMinutes = 10 }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8FF; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" max-width="540" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E9D5FF; box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.08); overflow: hidden; padding: 36px 32px;">
          
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); width: 48px; height: 48px; border-radius: 14px; text-align: center; line-height: 48px; color: #FFFFFF; font-size: 22px; font-weight: bold; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                🎙️
              </div>
              <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
                ${appName}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #7C3AED; font-weight: 600;">
                AI Speechwriter & Stage Coach
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #F3E8FF; padding-bottom: 28px;"></td>
          </tr>

          <!-- Body Message -->
          <tr>
            <td>
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #1E1B4B; text-align: center;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                You requested a secure login code for your <strong>${appName}</strong> account. Please use the verification code below to proceed:
              </p>
            </td>
          </tr>

          <!-- 6-Digit OTP Box -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <div style="display: inline-block; background: linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%); border: 2px dashed #9333EA; border-radius: 16px; padding: 18px 36px; text-align: center;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #6B21A8;">
                  ${otp}
                </span>
              </div>
            </td>
          </tr>

          <!-- Expiration & Security Info -->
          <tr>
            <td style="background-color: #F8FAFC; border-radius: 12px; padding: 16px 20px; border: 1px solid #E2E8F0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: top; width: 24px; padding-right: 8px;">
                    <span style="font-size: 16px;">⏱️</span>
                  </td>
                  <td style="font-size: 12px; color: #475569; line-height: 1.5;">
                    <strong>Expires in ${expirationMinutes} minutes.</strong> This single-use code can only be verified once.
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align: top; width: 24px; padding-right: 8px; padding-top: 8px;">
                    <span style="font-size: 16px;">🔒</span>
                  </td>
                  <td style="font-size: 12px; color: #64748B; line-height: 1.5; padding-top: 8px;">
                    <strong>Security Notice:</strong> Never share this code with anyone. Staff will never ask for your verification code.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 28px;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                If you did not request this verification code, you can safely ignore this email.<br>
                &copy; ${new Date().getFullYear()} ${appName}. Built for Hackathon Demo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Send OTP email via Resend API
 */
async function sendViaResend(toEmail, otp, expirationMinutes = 10) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'SpeechFlow AI <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: `Your ${otp} is your SpeechFlow AI verification code`,
      html: generateEmailTemplate({ otp, expirationMinutes }),
      text: `Your SpeechFlow AI verification code is: ${otp}. It expires in ${expirationMinutes} minutes. Never share this code.`,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Resend API returned error ' + response.status);
  }

  return { provider: 'resend', messageId: data.id };
}

/**
 * Send OTP email via SendGrid API
 */
async function sendViaSendGrid(toEmail, otp, expirationMinutes = 10) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM || 'no-reply@speechflow.ai';

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: from, name: 'SpeechFlow AI' },
      subject: `Your ${otp} is your SpeechFlow AI verification code`,
      content: [
        {
          type: 'text/html',
          value: generateEmailTemplate({ otp, expirationMinutes }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error ${response.status}: ${errorText}`);
  }

  return { provider: 'sendgrid', success: true };
}

/**
 * Send OTP email via SMTP (Gmail, Brevo, SendGrid SMTP, etc.)
 */
async function sendViaSmtp(toEmail, otp, expirationMinutes = 10) {
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : (user.endsWith('@gmail.com') ? 'smtp.gmail.com' : '');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const from = process.env.EMAIL_FROM || `"SpeechFlow AI" <${user || 'no-reply@speechflow.ai'}>`;

  const transportConfig = (host.includes('gmail') || user.endsWith('@gmail.com'))
    ? {
        service: 'gmail',
        auth: { user, pass },
      }
    : {
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false,
        },
      };

  const transporter = nodemailer.createTransport(transportConfig);

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject: `Your ${otp} is your SpeechFlow AI verification code`,
    html: generateEmailTemplate({ otp, expirationMinutes }),
    text: `Your SpeechFlow AI verification code is: ${otp}. It expires in ${expirationMinutes} minutes. Never share this code.`,
  });

  return { provider: 'smtp', messageId: info.messageId };
}

/**
 * Dispatch OTP email using the available configured provider
 */
export async function sendOtpEmail({ email, otp, expirationMinutes = 10 }) {
  // 1. Check Resend
  if (process.env.RESEND_API_KEY) {
    console.log(`📧 Dispatching OTP via Resend API to: ${email}`);
    return await sendViaResend(email, otp, expirationMinutes);
  }

  // 2. Check SendGrid
  if (process.env.SENDGRID_API_KEY) {
    console.log(`📧 Dispatching OTP via SendGrid API to: ${email}`);
    return await sendViaSendGrid(email, otp, expirationMinutes);
  }

  // 3. Check SMTP / Gmail
  if ((process.env.SMTP_HOST || process.env.SMTP_USER?.includes('@gmail.com')) && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`📧 Dispatching OTP via SMTP to: ${email}`);
    return await sendViaSmtp(email, otp, expirationMinutes);
  }

  // 4. Development/Demo Fallback: Nodemailer Ethereal Test Account
  // Allows testing when developer hasn't configured SMTP yet
  console.warn(`⚠️ [EmailService] No SMTP or Resend credentials set in .env! Attempting Ethereal test inbox...`);
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: '"SpeechFlow AI" <no-reply@speechflow.ai>',
      to: email,
      subject: `Your ${otp} is your SpeechFlow AI verification code`,
      html: generateEmailTemplate({ otp, expirationMinutes }),
      text: `Your SpeechFlow AI verification code is: ${otp}. It expires in ${expirationMinutes} minutes.`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`📬 Ethereal Test Email sent! Preview message in browser: ${previewUrl}`);
    return { provider: 'ethereal', previewUrl, messageId: info.messageId };
  } catch (err) {
    console.error('Failed to dispatch even via Ethereal:', err);
    throw new Error('Email service configuration missing. Please set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS in .env');
  }
}
