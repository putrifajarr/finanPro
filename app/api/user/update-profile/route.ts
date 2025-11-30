import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const updates = await req.json();

    if (!updates.id_user) {
      return NextResponse.json({ error: "id_user wajib diisi" }, { status: 400 });
    }

    // Validasi email agar tidak duplikat
    if (updates.email) {
      const exists = await prisma.app_users.findUnique({ where: { email: updates.email } });
      if (exists && exists.id_user !== updates.id_user) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
      }
    }

    const dataToUpdate: any = {};
    ["nama_lengkap", "email", "job", "phone", "description", "avatar_url"].forEach(
      (key) => {
        if (updates[key] !== undefined) dataToUpdate[key] = updates[key];
      }
    );

    const updatedUser = await prisma.app_users.update({
      where: { id_user: updates.id_user },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
