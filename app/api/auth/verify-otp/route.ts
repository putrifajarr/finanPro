import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: "Email tidak ditemukan" }, { status: 404 });
    }

    if (user.otp_code !== otp) {
      return Response.json({ error: "Kode OTP salah" }, { status: 400 });
    }

    if (user.otp_expires_at && user.otp_expires_at < new Date()) {
      return Response.json({ error: "Kode OTP sudah kadaluarsa" }, { status: 400 });
    }

    await prisma.users.update({
      where: { email },
      data: {
        status_verifikasi: true,
        otp_code: null,
        otp_expires_at: null,
      },
    });

    return Response.json({ message: "OTP berhasil diverifikasi" });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
