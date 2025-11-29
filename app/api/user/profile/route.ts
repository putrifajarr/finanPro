import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.app_users.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id_user: true,
        nama_lengkap: true,
        email: true,
        job: true,
        phone: true,
        description: true,
        avatar_url: true, // ✅ perbaikan typo
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Safety: fallback default avatar
    if (!user.avatar_url) {
      user.avatar_url = "/images/default-profile.png";
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
