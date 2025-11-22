import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { nama_lengkap, email, password } = await req.json();

    if (!email || !nama_lengkap || !password) {
      return Response.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) {
      return Response.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.users.create({
      data: {
        nama_lengkap,
        email,
        password,
        status_verifikasi: false,
        otp_code: otp,
        otp_expires_at: expires,
      },
    });

    // ---- KIRIM EMAIL OTP ----
    await transporter.sendMail({
      from: `"FinanPro" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Kode OTP Verifikasi Akun",
      html: `
        <h2>Kode OTP Verifikasi</h2>
        <p>Halo <b>${nama_lengkap}</b>,</p>
        <p>Kode OTP Anda adalah:</p>
        <h1 style="font-size:32px; letter-spacing:4px;">${otp}</h1>
        <p>Kode ini berlaku 10 menit.</p>
      `,
    });

    return Response.json({
      message: "Registrasi berhasil",
      redirect: `/verify-otp?email=${email}`,
      user,
    });

  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
