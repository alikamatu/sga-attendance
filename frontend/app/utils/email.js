// utils/email.js
const nodemailer = require("nodemailer");

const sendPasswordResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetUrl = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
};