import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

// Helper function to lazily initialize supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
};

export const POST = async (req: Request) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await req.formData();
    const file = formData.get("avatar") as File;
    const id_user = formData.get("id_user") as string;

    if (!file || !id_user)
      return NextResponse.json({ error: "Avatar atau id_user tidak ada" }, { status: 400 });

    // buat nama file unik
    const ext = file.name.split(".").pop();
    const avatarPath = `${id_user}/${Date.now()}.${ext}`;

    // upload ke Supabase Storage pakai admin client
    const { error: uploadError } = await supabaseAdmin.storage.from("avatars").upload(avatarPath, file, { upsert: true });
    if (uploadError) throw uploadError;

    // update database pakai Prisma (bypass RLS server-side)
    await prisma.app_users.update({
      where: { id_user: Number(id_user) },
      data: { avatar_url: avatarPath },
    });

    // ambil public URL untuk preview
    const { data: publicUrl } = supabaseAdmin.storage.from("avatars").getPublicUrl(avatarPath);

    return NextResponse.json({ publicUrl: publicUrl?.publicUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
