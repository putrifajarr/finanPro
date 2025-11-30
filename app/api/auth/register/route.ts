import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/sendOtp";

export async function POST(req: Request) {
  try {
    const { nama_lengkap, email, password } = await req.json();

    if (!nama_lengkap || !email || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // VALIDASI PASSWORD — tambahkan di sini!
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, dan simbol.",
        },
        { status: 400 }
      );
    }
    // END VALIDASI PASSWORD

    // check email duplicate
    const existing = await prisma.app_users.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    const newUser = await prisma.app_users.create({
      data: {
        nama_lengkap,
        email,
        password: hashedPassword,
        otp_code: otpCode,
        otp_expires_at: expiresAt,
      },
    });

    // kirim email OTP
    await sendOtpEmail(email, otpCode);

    return NextResponse.json({
      success: true,
      message: "Akun dibuat. Cek email untuk OTP.",
      redirect: `/kode-otp?email=${email}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
