import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getUserFromRequest(request: Request) {
  // --- PERBAIKAN PENTING ---
  // Ganti angka 1 di bawah ini dengan ID USER ASLI dari Prisma Studio.
  // Contoh: Jika di tabel app_users id-nya 5, tulis return 5;
  
  return 1; // <--- GANTI ANGKA INI SESUAI DATABASE ANDA
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: "Unauthorized: Harap login terlebih dahulu" },
    { status: 401 }
  );
}