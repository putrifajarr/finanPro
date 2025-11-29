import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, 
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: `"FinanPro" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Kode OTP FinanPro",
    html: `
      <p>Kode OTP Anda:</p>
      <h2 style="font-size: 24px; letter-spacing: 4px;">${otp}</h2>
      <p>Berlaku 5 menit.</p>
    `,
  });
}
