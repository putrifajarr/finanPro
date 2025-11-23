import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Kode OAuth tidak ditemukan" },
      { status: 400 }
    );
  }

  // Tukar OAuth code ke session Supabase
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.json(
      { error: error?.message || "Gagal autentikasi Google" },
      { status: 500 }
    );
  }

  const supaUser = data.user;

  if (!supaUser.email) {
    return NextResponse.json(
      { error: "Google tidak memberikan email" },
      { status: 400 }
    );
  }

  // Simpan / update user ke Prisma
  await prisma.users.upsert({
    where: { email: supaUser.email },
    update: {
      google_auth_id: supaUser.id,
      status_verifikasi: true,
    },
    create: {
      nama_lengkap: supaUser.user_metadata.full_name || "Pengguna Google",
      email: supaUser.email,
      google_auth_id: supaUser.id,
      status_verifikasi: true,
      otp_code: null,
      otp_expires_at: null,
    },
  });

  return NextResponse.redirect("http://localhost:3000/dashboard/home");
}
