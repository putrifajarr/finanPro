// Mengamankan API GET (Read All) dan POST (Create) dengan menggunakan user_id dari lib/authUtils.ts untuk memfilter data

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUtils'; // Import fungsi otentikasi

// Interface untuk data Hutang/Piutang
interface HutangPiutangData {
  nama_pihak: string;
  jenis_hutang_piutang: 'hutang' | 'piutang'; // ENUM dari DB Anda
  jumlah: number;
  jatuh_tempo: Date;
  status_pembayaran: 'belum_lunas' | 'lunas' | 'dicicil'; // ENUM dari DB Anda
}

// === FUNGSI GET (READ ALL) ===
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Akses ditolak. Sesi tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }

    // Hanya ambil data hutang_piutang yang user_id-nya sesuai
    const dataHutangPiutang = await prisma.hutang_piutang.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        jatuh_tempo: 'asc', // Urutkan berdasarkan jatuh tempo terdekat
      },
    });

    return NextResponse.json(dataHutangPiutang, { status: 200 });

  } catch (err: any) {
    console.error("Kesalahan saat mengambil data:", err);
    return NextResponse.json({ error: "Kesalahan Server Internal" }, { status: 500 });
  }
}

// === FUNGSI POST (CREATE) ===
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Akses ditolak. Sesi tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }

    const body: HutangPiutangData = await req.json();
    const { nama_pihak, jenis_hutang_piutang, jumlah, jatuh_tempo, status_pembayaran } = body;

    // Validasi input
    if (!nama_pihak || !jenis_hutang_piutang || typeof jumlah !== 'number' || !jatuh_tempo || !status_pembayaran) {
      return NextResponse.json(
        { error: "Data yang dikirim tidak lengkap atau tidak valid." },
        { status: 400 }
      );
    }

    const newEntry = await prisma.hutang_piutang.create({
      data: {
        user_id: userId, // 👈 Otomatis memasukkan user_id dari sesi
        nama_pihak,
        jenis_hutang_piutang,
        jumlah,
        jatuh_tempo: new Date(jatuh_tempo), // Pastikan format Date
        status_pembayaran,
      },
    });

    return NextResponse.json(
        { message: "Data Hutang/Piutang berhasil ditambahkan", data: newEntry }, 
        { status: 201 }
    );

  } catch (err: any) {
    console.error("Kesalahan saat membuat data:", err);
    return NextResponse.json({ error: "Kesalahan Server Internal" }, { status: 500 });
  }
}