import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return Response.json({ error: "Email tidak ditemukan" }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.users.update({
      where: { email },
      data: {
        otp_code: otp,
        otp_expires_at: expires,
      },
    });

    // Kirim OTP
    await transporter.sendMail({
      from: `"FinanPro" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Kode OTP Baru",
      html: `
        <h2>Kode OTP Baru</h2>
        <p>Kode OTP baru Anda adalah:</p>
        <h1 style="font-size:32px; letter-spacing:4px;">${otp}</h1>
        <p>Kode berlaku 10 menit.</p>
      `,
    });

    return Response.json({ message: "OTP baru telah dikirim" });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
