const nodemailer = require('nodemailer');

// Build a reusable transporter. Defaults to Gmail but can be configured via env.
function createTransporter() {
  const service = process.env.EMAIL_SERVICE || 'Gmail';
  const host = process.env.EMAIL_HOST; // optional if not using a well-known service
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
  const secure = process.env.EMAIL_SECURE === 'true' ? true : (typeof port === 'number' ? port === 465 : undefined);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set. Emails will fail to send.');
  }

  const baseConfig = host
    ? { host, port, secure }
    : { service };

  return nodemailer.createTransport({
    ...baseConfig,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const transporter = createTransporter();

function renderWelcomeHtml(name) {
  const safeName = String(name || '').replace(/[<>]/g, '');
  return (
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Expense Tracker</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #111827; }
          .container { max-width: 560px; margin: 0 auto; padding: 24px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; }
          .btn { display: inline-block; background: #3b82f6; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1>Welcome, ${safeName} 👋</h1>
            <p>Thanks for registering with Expense Tracker. We're excited to have you!</p>
            <p>Start tracking your expenses and stay on top of your budget.</p>
            <p style="margin-top: 24px;">
              <a class="btn" href="#" target="_blank" rel="noopener noreferrer">Open your dashboard</a>
            </p>
            <p style="color:#6b7280; font-size: 12px; margin-top: 24px;">If you didn’t create this account, you can ignore this email.</p>
          </div>
        </div>
      </body>
    </html>`
  );
}

async function sendEmail({ to, subject, text, html }) {
  const fromAddress = process.env.EMAIL_FROM || `"Expense Tracker" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`;
  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    console.log('📧 Email sent:', info && (info.messageId || info.response));
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeEmail(toEmail, userName) {
  const fromAddress = process.env.EMAIL_FROM || `"Expense Tracker" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`;
  const subject = 'Welcome to Expense Tracker!';
  const text = `Welcome, ${userName}!

Thanks for registering with Expense Tracker. We're excited to have you on board!`;
  const html = renderWelcomeHtml(userName);

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
      html,
    });
    console.log('📧 Welcome email sent:', info && (info.messageId || info.response));
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendWelcomeEmail, sendEmail };


