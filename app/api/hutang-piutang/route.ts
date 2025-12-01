// app/api/hutang-piutang/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Pastikan path ini sesuai lokasi prisma client Anda

// 1. GET: Ambil semua data hutang/piutang
export async function GET() {
  try {
    const data = await prisma.hutang_piutang.findMany({
      include: {
        user: true, // Opsional: kalau mau lihat nama user pemilik hutang
      },
      orderBy: {
        // Karena tidak ada createdAt, kita urutkan by ID atau jatuh_tempo
        jatuh_tempo: 'asc', 
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 2. POST: Tambah data baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Perhatikan nama field harus sesuai schema.prisma
    const { user_id, nama_pihak, jenis_hutang_piutang, jumlah, jatuh_tempo } = body;

    // Validasi sederhana
    if (!user_id || !nama_pihak || !jenis_hutang_piutang || !jumlah) {
       return NextResponse.json({ error: 'Data wajib belum lengkap' }, { status: 400 });
    }

    const dataBaru = await prisma.hutang_piutang.create({
      data: {
        user_id: Number(user_id), // untuk memastkan int
        nama_pihak: nama_pihak,
        jenis_hutang_piutang: jenis_hutang_piutang, // harus "hutang" atau "piutang" (sesuai enum yg dipilih)
        jumlah: jumlah, // Prisma akan otomatis convert ke Decimal
        jatuh_tempo: jatuh_tempo ? new Date(jatuh_tempo) : null,
        status_pembayaran: "belum_lunas" // Default value dari schema
      }
    });

    return NextResponse.json(dataBaru, { status: 201 });
  } catch (error) {
    console.error("Error creating data:", error);
    return NextResponse.json({ error: 'Gagal create data' }, { status: 500 });
  }
}