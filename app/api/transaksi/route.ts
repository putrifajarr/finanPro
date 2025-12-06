import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- GET: AMBIL DATA ---
export async function GET(req: NextRequest) {
  try {
    // HARDCODE USER ID = 1 (Untuk Debugging)
    const userId = 1; 

    console.log(`[GET] Mengambil data untuk User ID: ${userId}`);

    const transaksi = await prisma.transaksi.findMany({
      where: { user_id: userId },
      orderBy: { tanggal: "desc" },
      include: { kategori: true },
    });

    return NextResponse.json(transaksi, { status: 200 });
  } catch (error: any) {
    console.error("[GET] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: TAMBAH DATA ---
export async function POST(req: NextRequest) {
  try {
    // HARDCODE USER ID = 1
    const userId = 1;

    const body = await req.json();
    console.log("[POST] Data diterima:", body);

    const { tanggal, total_harga, deskripsi, jenis_transaksi } = body;

    // Validasi Sederhana
    if (!tanggal || total_harga === undefined || !jenis_transaksi) {
      return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
    }

    // 1. Cek User (Buat jika belum ada, agar tidak error foreign key)
    let user = await prisma.app_users.findUnique({ where: { id_user: userId } });
    if (!user) {
      console.log("[POST] User 1 belum ada, membuat user dummy...");
      user = await prisma.app_users.create({
        data: {
          id_user: 1,
          nama_lengkap: "User Debug",
          email: "debug@local.com",
          password: "123"
        }
      });
    }

    // 2. Cek Kategori (Buat jika belum ada)
    const jenisDb = jenis_transaksi.toLowerCase() === "pemasukan" ? "pemasukan" : "pengeluaran";
    let kategori = await prisma.kategori.findFirst({ where: { jenis_kategori: jenisDb } });

    if (!kategori) {
      console.log(`[POST] Kategori ${jenisDb} belum ada, membuatnya...`);
      kategori = await prisma.kategori.create({
        data: {
          nama_kategori: "operasional",
          jenis_kategori: jenisDb,
        }
      });
    }

    // 3. Simpan Transaksi
    const newTransaksi = await prisma.transaksi.create({
      data: {
        user_id: userId,
        tanggal: new Date(tanggal),
        total_harga: Number(total_harga),
        deskripsi: deskripsi || "",
        id_kategori: kategori.id_kategori,
      },
    });

    console.log("[POST] Berhasil disimpan:", newTransaksi.id_transaksi);
    return NextResponse.json(newTransaksi, { status: 201 });

  } catch (error: any) {
    console.error("[POST] CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}