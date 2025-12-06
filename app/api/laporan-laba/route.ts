import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // GANTI dengan session user ID Anda nanti
    const userId = 1; 

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    // 1. Ambil Transaksi (Pemasukan, Beban, Pajak)
    const transactions = await prisma.transaksi.findMany({
      where: {
        user_id: userId,
        tanggal: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      include: { kategori: true },
      orderBy: { tanggal: 'asc' } // Urutkan tanggal agar grafik rapi
    });

    // 2. Ambil Transaksi Detail untuk Hitung HPP
    const soldItems = await prisma.transaksi_detail.findMany({
      where: {
        transaksi: {
          user_id: userId,
          tanggal: { gte: new Date(startDate), lte: new Date(endDate) },
          kategori: { nama_kategori: "penjualan" },
        },
      },
      include: { 
        produk: true,
        transaksi: true // Kita butuh tanggal dari parent transaksi
      },
    });

    // --- LOGIKA UTAMA: Grouping Data per Tanggal untuk Grafik ---
    // Kita buat Map/Dictionary untuk menampung laba per hari
    // Format Key: "YYYY-MM-DD"
    const dailyMap: Record<string, number> = {};

    // Helper function untuk init tanggal di map
    const addToDate = (date: Date, amount: number) => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (!dailyMap[dateStr]) dailyMap[dateStr] = 0;
        dailyMap[dateStr] += amount;
    };

    // A. Proses Transaksi Umum (Penjualan menambah, Beban/Pajak mengurangi)
    let totalPenjualan = 0;
    let totalOperasional = 0;
    let totalPajak = 0;

    transactions.forEach((t) => {
      const amount = t.total_harga;
      const cat = t.kategori?.nama_kategori;
      
      if (cat === "penjualan") {
          totalPenjualan += amount;
          addToDate(t.tanggal, amount); // Tambah ke grafik (Income)
      } else if (cat === "operasional") {
          totalOperasional += amount;
          addToDate(t.tanggal, -amount); // Kurang dari grafik (Expense)
      } else if (cat === "pajak") {
          totalPajak += amount;
          addToDate(t.tanggal, -amount); // Kurang dari grafik (Tax)
      }
    });

    // B. Proses HPP (Mengurangi Laba)
    let totalHPP = 0;
    soldItems.forEach((item) => {
      const qty = item.jumlah_barang || 0;
      const modal = Number(item.produk?.harga_pokok) || 0;
      const hppAmount = qty * modal;

      totalHPP += hppAmount;
      // Kurangi laba harian dengan HPP pada tanggal transaksi terjadi
      addToDate(item.transaksi.tanggal, -hppAmount); 
    });

    // C. Format Data Grafik untuk Recharts
    // Mengubah object { "2023-01-01": 50000 } menjadi array [{ date: "01 Jan", value: 50000 }]
    const chartData = Object.keys(dailyMap).sort().map(key => ({
        date: format(new Date(key), "dd MMM"), // Format tampilan di sumbu X
        fullDate: key,
        value: dailyMap[key] // Ini adalah Laba Bersih Harian
    }));

    // --- HITUNG TOTAL AKHIR ---
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
        labaKotor,
        labaOperasional,
        labaBersih
      },
      chartData // <--- Data baru untuk grafik
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}