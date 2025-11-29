import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/sendOtp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email)
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );

    const user = await prisma.app_users.findUnique({
      where: { email },
    });

    if (!user)
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.app_users.update({
      where: { email },
      data: {
        otp_code: code,
        otp_expires_at: expiresAt,
      },
    });

    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true, message: "OTP dikirim." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
