// Mengamankan API GET, PUT (Update), dan DELETE dengan memastikan transaksi hanya berlaku untuk data yang memiliki user_id yang sedang login.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUtils'; // Import fungsi otentikasi

// Interface untuk menangkap parameter dinamis [id]
interface Params {
  params: {
    id: string; // id_hutang_piutang adalah UUID
  };
}

// Interface untuk data Hutang/Piutang yang diupdate
interface UpdateHutangPiutangData {
  nama_pihak?: string;
  jenis_hutang_piutang?: 'hutang' | 'piutang';
  jumlah?: number;
  jatuh_tempo?: Date;
  status_pembayaran?: 'belum_lunas' | 'lunas' | 'dicicil';
}

// === FUNGSI GET (READ ONE) ===
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "Akses ditolak. Sesi tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }

    const entry = await prisma.hutang_piutang.findUnique({
      where: {
        id_hutang_piutang: id,
        user_id: userId, // 👈 Pastikan hanya pemilik yang bisa melihat
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Data Hutang/Piutang tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry, { status: 200 });

  } catch (err: any) {
    console.error("Kesalahan saat mengambil data detail:", err);
    return NextResponse.json({ error: "Kesalahan Server Internal" }, { status: 500 });
  }
}

// === FUNGSI PUT (UPDATE) ===
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "Akses ditolak. Sesi tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }

    const body: UpdateHutangPiutangData = await req.json();

    // Pastikan setidaknya ada satu field yang akan diupdate
    if (Object.keys(body).length === 0) {
        return NextResponse.json(
            { error: "Tidak ada data yang dikirim untuk diupdate." },
            { status: 400 }
        );
    }

    const updatedEntry = await prisma.hutang_piutang.update({
      where: {
        id_hutang_piutang: id,
        user_id: userId, // 👈 Pastikan hanya pemilik yang bisa mengupdate
      },
      data: {
        ...body,
        // Konversi jatuh_tempo ke Date jika ada di body
        ...(body.jatuh_tempo && { jatuh_tempo: new Date(body.jatuh_tempo) }), 
      },
    });

    return NextResponse.json(
        { message: "Data Hutang/Piutang berhasil diupdate", data: updatedEntry }, 
        { status: 200 }
    );

  } catch (err: any) {
    // P.2001 means "Record to update not found"
    if (err.code === 'P2001') {
        return NextResponse.json(
            { error: "Data Hutang/Piutang tidak ditemukan atau bukan milik Anda" }, 
            { status: 404 }
        );
    }
    console.error("Kesalahan saat mengupdate data:", err);
    return NextResponse.json({ error: "Kesalahan Server Internal" }, { status: 500 });
  }
}

// === FUNGSI DELETE (DELETE) ===
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(req);
    const { id } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "Akses ditolak. Sesi tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }

    // Cara yang aman untuk delete: Cari dulu dengan user_id
    const existingEntry = await prisma.hutang_piutang.findUnique({
      where: {
        id_hutang_piutang: id,
        user_id: userId,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Data Hutang/Piutang tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      );
    }

    await prisma.hutang_piutang.delete({
      where: {
        id_hutang_piutang: id,
      },
    });

    return NextResponse.json(
        { message: "Data Hutang/Piutang berhasil dihapus" }, 
        { status: 200 }
    );

  } catch (err: any) {
    console.error("Kesalahan saat menghapus data:", err);
    return NextResponse.json({ error: "Kesalahan Server Internal" }, { status: 500 });
  }
}