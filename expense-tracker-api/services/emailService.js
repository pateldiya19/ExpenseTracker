const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendWelcomeEmail = async (toEmail, userName) => {
  await transporter.sendMail({
    from: '"Expense Tracker" <no-reply@expensetracker.com>',
    to: toEmail,
    subject: 'Welcome to Expense Tracker!',
    html: `<h1>Welcome, ${userName}!</h1><p>Thanks for registering.</p>`
  });
};

module.exports = { sendWelcomeEmail };
