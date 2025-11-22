import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cegah login password untuk akun Google
    if (user.google_auth_id) {
      return Response.json(
        { error: "Akun ini hanya bisa login dengan Google" },
        { status: 400 }
      );
    }

    if (user.password !== password) {
      return Response.json(
        { error: "Password salah" },
        { status: 401 }
      );
    }

    // Jika belum verifikasi → redirect OTP
    if (!user.status_verifikasi) {
      return Response.json(
        {
          error: "Akun belum diverifikasi. Silakan masukkan OTP.",
          redirect: `/verify-otp?email=${email}`,
        },
        { status: 403 }
      );
    }

    return Response.json({
      message: "Login berhasil",
      redirect: "/dashboard/home",
    });

  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
