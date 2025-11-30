import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil" });
  
  // Hapus cookie session
  response.cookies.set("session", "", { maxAge: 0, path: "/" });

  return response;
}
