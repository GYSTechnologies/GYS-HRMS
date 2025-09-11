import nodemailer from "nodemailer";

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
    from: `"GYS-Technologies " <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to GYS-Technologies  - Your Login Details",
    html: htmlContent,
  });
};
