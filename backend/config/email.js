import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();


// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS, // app password
  },
});


// Send Welcome Email to New Employee
export const sendWelcomeEmail = async (to, { firstName, email, password, dateOfJoining }) => {
  const formattedDate = new Date(dateOfJoining).toDateString();

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #104774; text-align: center;">Welcome to GYS Technologies 🎉</h2>
    <p>Dear <strong>${firstName}</strong>,</p>
    <p>Your employee profile has been successfully created in <b>GYS Technologies </b>.</p>

    <h3 style="color: #104774;">Your Login Credentials</h3>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>
    </div>

    <p style="margin-top: 15px; color: #e63946;">
      <b>Note:</b> You will not be able to login before your joining date.  
      Your joining date is <b>${formattedDate}</b>.
    </p>

    <br/>
    <p>Best regards,<br/>HR Team - GYS Technologies</p>
  </div>
  `;

  await transporter.sendMail({
    from: `"GYS-Technologies " <${process.env.MAIL_USER}>`,
    to,
    subject: "Welcome to GYS-Technologies  - Your Login Details",
    html: htmlContent,
  });
};

// Send Password Reset OTP Email
export const sendOTPEmail = async (to, otp) => {
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;">
    <h2 style="color: #104774; text-align: center;">Password Reset Request 🔑</h2>
    
    <p>Dear User,</p>
    <p>We have received a request to reset your account password. Please use the OTP below to proceed with resetting your password:</p>

    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 5px; color: #104774; margin: 0;">${otp}</p>
    </div>

    <p style="margin-top: 15px; color: #e63946;">
      <b>Note:</b> This OTP is valid for <b>10 minutes</b>.  
      If you did not request a password reset, please ignore this email.
    </p>

    <br/>
    <p>Best regards,<br/>HR Team - GYS Technologies</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #777; text-align: center;">
      This is an automated message, please do not reply to this email.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"GYS Technologies" <${process.env.MAIL_USER}>`,
    to,
    subject: "Password Reset OTP - GYS Technologies",
    html: htmlContent,
  });
};
