import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/authUtils'; 

// --- PENTING: Definisi Tipe untuk Next.js 15 ---
// Params sekarang dibungkus dalam Promise
type RouteProps = {
  params: Promise<{ id: string }>;
};

// === FUNGSI GET (Detail) ===
export async function GET(req: NextRequest, props: RouteProps) {
  try {
    // FIX NEXT.JS 15: Await params dulu!
    const params = await props.params;
    const { id } = params;

    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entry = await prisma.hutang_piutang.findFirst({
      where: { id_hutang_piutang: id, user_id: userId },
    });

    if (!entry) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json(entry, { status: 200 });

  } catch (err: any) {
    console.error("GET Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// === FUNGSI PUT (UPDATE) ===
export async function PUT(req: NextRequest, props: RouteProps) {
  try {
    // FIX NEXT.JS 15: Await params dulu!
    const params = await props.params;
    const { id } = params;
    
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // 1. Cek Kepemilikan
    const existingEntry = await prisma.hutang_piutang.findFirst({
      where: { id_hutang_piutang: id, user_id: userId },
    });

    if (!existingEntry) {
        return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // 2. Validasi Tanggal (Pencegahan Error Invalid Date)
    let validDate = undefined;
    if (body.jatuh_tempo) {
        const d = new Date(body.jatuh_tempo);
        if (!isNaN(d.getTime())) validDate = d;
    }

    // 3. Update
    const updatedEntry = await prisma.hutang_piutang.update({
      where: { id_hutang_piutang: id },
      data: {
        nama_pihak: body.nama_pihak,
        jenis_hutang_piutang: body.jenis_hutang_piutang,
        jumlah: body.jumlah,
        ...(validDate && { jatuh_tempo: validDate }), // Hanya update jika tanggal valid
        status_pembayaran: body.status_pembayaran,
      },
    });

    return NextResponse.json({ message: "Berhasil diupdate", data: updatedEntry }, { status: 200 });

  } catch (err: any) {
    console.error("PUT Error:", err);
    return NextResponse.json({ error: "Internal Server Error: " + err.message }, { status: 500 });
  }
}

// === FUNGSI DELETE (HAPUS) ===
export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    // FIX NEXT.JS 15: Await params dulu!
    const params = await props.params;
    const { id } = params;

    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Cek Kepemilikan
    const existingEntry = await prisma.hutang_piutang.findFirst({
      where: { id_hutang_piutang: id, user_id: userId },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // 2. Hapus
    await prisma.hutang_piutang.delete({
      where: { id_hutang_piutang: id },
    });

    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });

  } catch (err: any) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ error: "Internal Server Error: " + err.message }, { status: 500 });
  }
}