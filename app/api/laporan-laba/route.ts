import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Pastikan ID User ini benar-benar ada di tabel app_users Anda
    const userId = 1; 

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    // 1. Ambil Transaksi (Aman dari data null)
    const transactions = await prisma.transaksi.findMany({
      where: {
        user_id: userId,
        tanggal: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      include: { kategori: true },
      orderBy: { tanggal: 'asc' }
    });

    // 2. Ambil Detail untuk HPP
    const soldItems = await prisma.transaksi_detail.findMany({
      where: {
        transaksi: {
          user_id: userId,
          tanggal: { gte: new Date(startDate), lte: new Date(endDate) },
          kategori: { nama_kategori: "penjualan" },
        },
      },
      include: { produk: true, transaksi: true },
    });

    // --- LOGIKA GROUPING ---
    const dailyMap: Record<string, number> = {};

    const addToDate = (date: Date, amount: number) => {
        // Gunakan try-catch saat format tanggal untuk jaga-jaga
        try {
            const dateStr = format(date, "yyyy-MM-dd");
            if (!dailyMap[dateStr]) dailyMap[dateStr] = 0;
            dailyMap[dateStr] += amount;
        } catch (e) {
            console.error("Error formatting date:", date);
        }
    };

    let totalPenjualan = 0;
    let totalOperasional = 0;
    let totalPajak = 0;

    transactions.forEach((t) => {
      // Konversi ke Number untuk menghindari masalah Decimal/Float
      const amount = Number(t.total_harga) || 0;
      // Gunakan optional chaining (?.) agar tidak crash jika kategori dihapus
      const cat = t.kategori?.nama_kategori?.toLowerCase(); 
      
      if (cat === "penjualan") {
          totalPenjualan += amount;
          addToDate(t.tanggal, amount);
      } else if (cat === "operasional") {
          totalOperasional += amount;
          addToDate(t.tanggal, -amount);
      } else if (cat === "pajak") {
          totalPajak += amount;
          addToDate(t.tanggal, -amount);
      }
    });

    let totalHPP = 0;
    soldItems.forEach((item) => {
      const qty = Number(item.jumlah_barang) || 0;
      // Ambil harga pokok, default 0 jika produk terhapus
      const modal = Number(item.produk?.harga_pokok) || 0; 
      const hppAmount = qty * modal;

      totalHPP += hppAmount;
      if (item.transaksi?.tanggal) {
          addToDate(item.transaksi.tanggal, -hppAmount);
      }
    });

    // Format Data Grafik
    const chartData = Object.keys(dailyMap).sort().map(key => ({
        date: format(new Date(key), "dd MMM", { locale: id }),
        fullDate: key,
        value: dailyMap[key]
    }));

    const labaKotor = totalPenjualan - totalHPP;
    const labaOperasional = labaKotor - totalOperasional;
    const labaBersih = labaOperasional - totalPajak;

    return NextResponse.json({
      summary: {
          penjualan: totalPenjualan,
          hpp: totalHPP,
          operasional: totalOperasional,
          pajak: totalPajak
      },
      totals: {
        labaKotor, labaOperasional, labaBersih
      },
      chartData
    });

  } catch (error: any) {
    // Ini akan memunculkan detail error di Terminal VS Code Anda
    console.error("🔥 API CRASH ERROR:", error); 
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}