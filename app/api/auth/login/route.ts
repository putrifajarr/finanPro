import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/hash";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.app_users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika user adalah Google Login
    if (user.google_auth_id) {
      return NextResponse.json(
        { error: "Akun ini hanya bisa login dengan Google" },
        { status: 400 }
      );
    }

    // Cek password
    const valid = await comparePassword(password, user.password || "");
    if (!valid) {
      return NextResponse.json(
        { error: "Password salah" },
        { status: 401 }
      );
    }

    // Jika OTP belum diverifikasi
    if (!user.status_verifikasi) {
      return NextResponse.json(
        {
          error: "Akun belum diverifikasi",
          redirect: `/kode-otp?email=${email}`,
        },
        { status: 403 }
      );
    }

    // Buat session token sederhana
    const token = JSON.stringify({
      id: user.id_user,
      email: user.email,
      time: Date.now(),
    });

    // Simpan session di cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      redirect: "/dashboard/home",
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
