import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Fix untuk Next.js 15: params adalah Promise
type Context = {
  params: Promise<{ id: string }>;
};

// --- PUT: EDIT DATA ---
export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params; // WAJIB AWAIT
    // HARDCODE USER ID = 1 (Agar konsisten dengan route.ts)
    const userId = 1; 

    console.log(`[PUT] Request Edit ID: ${id}`);

    const body = await req.json();
    const { tanggal, total_harga, deskripsi, jenis_transaksi } = body;

    // 1. Cek Transaksi
    const existing = await prisma.transaksi.findUnique({ where: { id_transaksi: id } });
    
    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    // 2. Handle Kategori (jika user mengubah jenis transaksi)
    let idKategoriToUse = existing.id_kategori;
    
    if (jenis_transaksi) {
      const jenisDb = jenis_transaksi.toLowerCase() === "pemasukan" ? "pemasukan" : "pengeluaran";
      
      let kategoriValid = await prisma.kategori.findFirst({ 
        where: { jenis_kategori: jenisDb } 
      });
      
      if (!kategoriValid) {
         // Buat baru jika belum ada
         console.log(`[PUT] Kategori ${jenisDb} belum ada, membuatnya...`);
         kategoriValid = await prisma.kategori.create({
            data: { 
              nama_kategori: "operasional", 
              jenis_kategori: jenisDb 
            }
         });
      }
      idKategoriToUse = kategoriValid.id_kategori;
    }

    // 3. Update Data
    const updated = await prisma.transaksi.update({
      where: { id_transaksi: id },
      data: {
        tanggal: new Date(tanggal),
        total_harga: Number(total_harga),
        deskripsi,
        id_kategori: idKategoriToUse,
      },
    });

    console.log("[PUT] Berhasil update:", updated.id_transaksi);
    revalidatePath("/dashboard/home");
    return NextResponse.json({ message: "Update berhasil", data: updated }, { status: 200 });

  } catch (error: any) {
    console.error("[PUT] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- DELETE: HAPUS DATA ---
export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params; // WAJIB AWAIT
    console.log(`[DELETE] Request Hapus ID: ${id}`);

    // 1. Hapus Detail (Anak) Dulu
    // Kita pakai try-catch khusus di sini supaya kalau kosong tidak error
    try {
        const deletedDetails = await prisma.transaksi_detail.deleteMany({
            where: { id_transaksi: id }
        });
        console.log(`[DELETE] Menghapus ${deletedDetails.count} detail transaksi.`);
    } catch (e) {
        console.log("[DELETE] Info: Tidak ada detail transaksi atau gagal hapus detail.");
    }

    // 2. Hapus Transaksi (Induk)
    await prisma.transaksi.delete({
      where: { id_transaksi: id },
    });

    console.log("[DELETE] Berhasil menghapus transaksi induk.");
    revalidatePath("/dashboard/home");
    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });

  } catch (error: any) {
    console.error("[DELETE] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}