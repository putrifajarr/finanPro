import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan OTP wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.app_users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika OTP tidak cocok
    if (user.otp_code !== code) {
      return NextResponse.json(
        { error: "Kode OTP salah" },
        { status: 400 }
      );
    }

    // Jika OTP expired
    if (!user.otp_expires_at || user.otp_expires_at < new Date()) {
      return NextResponse.json(
        {
          error: "Kode OTP sudah kedaluwarsa",
          redirect: `/otp-expired?email=${email}`,
        },
        { status: 400 }
      );
    }

    // OTP valid → verifikasi akun
    await prisma.app_users.update({
      where: { email },
      data: {
        status_verifikasi: true,
        otp_code: null,
        otp_expires_at: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil",
      redirect: "/dashboard/home",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}
