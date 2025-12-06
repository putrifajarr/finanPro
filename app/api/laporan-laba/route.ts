import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Agar tidak di-cache statis oleh Next.js

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // TODO: Nanti ganti "1" dengan ID user dari session login Anda
    const userId = 1; 

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    // 1. Ambil Transaksi dari DB
    const transactions = await prisma.transaksi.findMany({
      where: {
        user_id: userId,
        tanggal: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        kategori: true, // Join ke tabel kategori untuk cek jenisnya
      },
    });

    // 2. Siapkan Wadah (Accumulator)
    let summary = {
      penjualan: 0,
      pembelian: 0,   // Ini dianggap HPP
      operasional: 0,
      pajak: 0,
    };

    // 3. Loop & Hitung
    transactions.forEach((trx) => {
      // Pastikan kategori ada (jaga-jaga jika data kotor)
      if (!trx.kategori) return;

      const amount = trx.total_harga; // Tipe Float
      const nama = trx.kategori.nama_kategori; // Enum: penjualan, pembelian, operasional, pajak

      if (nama === "penjualan") {
        summary.penjualan += amount;
      } else if (nama === "pembelian") {
        summary.pembelian += amount;
      } else if (nama === "operasional") {
        summary.operasional += amount;
      } else if (nama === "pajak") {
        summary.pajak += amount;
      }
    });

    // 4. Rumus Laba Rugi
    // Laba Kotor = Penjualan - HPP (Pembelian)
    const labaKotor = summary.penjualan - summary.pembelian;
    
    // Laba Operasional = Laba Kotor - Beban (Operasional)
    const labaOperasional = labaKotor - summary.operasional;
    
    // Laba Bersih = Laba Operasional - Pajak
    const labaBersih = labaOperasional - summary.pajak;

    return NextResponse.json({
      summary,
      totals: {
        labaKotor,
        labaOperasional,
        labaBersih
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}