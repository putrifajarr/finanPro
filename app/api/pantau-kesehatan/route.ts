import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subDays, subMonths, format } from "date-fns";
import { id } from "date-fns/locale"; 

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // --- PENTING: GANTI INI DENGAN ID USER YANG BENAR ---
    // Cek tabel 'app_users' di Supabase Anda, lihat kolom 'id_user'.
    const userId = 1; 

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "30 Hari";

    // 1. DATA KARTU (Status, Saldo, Cashflow)
    // ----------------------------------------
    // Ambil SEMUA transaksi untuk hitung Saldo Real
    const txAllTime = await prisma.transaksi.findMany({
        where: { user_id: userId },
        include: { kategori: true }
    });

    // Hitung Saldo Saat Ini (Total Masuk - Total Keluar Selamanya)
    let totalMasuk = 0;
    let totalKeluar = 0;
    txAllTime.forEach(t => {
        const cat = t.kategori?.nama_kategori; // 'penjualan', 'pembelian', etc.
        if (cat === 'penjualan') totalMasuk += t.total_harga;
        else if (['pembelian', 'operasional', 'pajak'].includes(cat)) totalKeluar += t.total_harga;
    });
    const saldoSaatIni = totalMasuk - totalKeluar;

    // Ambil Data Bulan Ini (Untuk Cashflow & Rasio)
    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);
    
    const txThisMonth = await prisma.transaksi.findMany({
        where: { user_id: userId, tanggal: { gte: startMonth, lte: endMonth } },
        include: { kategori: true }
    });

    // Hitung Cashflow Bulan Ini
    let cfMasuk = 0; 
    let cfKeluar = 0;
    let revenueBulanIni = 0;
    txThisMonth.forEach(t => {
        const cat = t.kategori?.nama_kategori;
        if (cat === 'penjualan') { cfMasuk += t.total_harga; revenueBulanIni += t.total_harga; }
        else if (['pembelian', 'operasional', 'pajak'].includes(cat)) { cfKeluar += t.total_harga; }
    });
    
    // Hitung Rasio Laba (Sederhana: Revenue - Pengeluaran Bulan Ini / Revenue)
    // Note: Untuk akurasi tinggi perlu HPP, tapi ini estimasi cepat agar tidak 0
    let rasioLaba = 0;
    if (revenueBulanIni > 0) {
        rasioLaba = ((revenueBulanIni - cfKeluar) / revenueBulanIni) * 100;
    }

    // Tentukan Status
    let status = "Sehat";
    let pesan = "Pertahankan kinerja bisnis.";
    let warna = "green";
    if (saldoSaatIni < 0) { status = "Bahaya"; pesan = "Saldo negatif."; warna = "red"; }

    // 2. DATA GRAFIK (Pemasukan vs Pengeluaran)
    // -----------------------------------------
    let chartStartDate = subDays(now, 30);
    let dateFormat = "dd MMM"; 

    if (rangeParam === "6 Bulan") {
        chartStartDate = subMonths(now, 6);
        dateFormat = "MMM yyyy";
    } else if (rangeParam === "12 Bulan") {
        chartStartDate = subMonths(now, 12);
        dateFormat = "MMM yyyy";
    }

    const txChart = await prisma.transaksi.findMany({
        where: { user_id: userId, tanggal: { gte: chartStartDate, lte: now } },
        include: { kategori: true },
        orderBy: { tanggal: 'asc' }
    });

    // Grouping Data
    const dailyMap: Record<string, { pemasukan: number; pengeluaran: number }> = {};
    
    txChart.forEach(t => {
        const dateKey = format(t.tanggal, dateFormat, { locale: id });
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { pemasukan: 0, pengeluaran: 0 };

        const val = t.total_harga;
        const cat = t.kategori?.nama_kategori;

        if (cat === 'penjualan') dailyMap[dateKey].pemasukan += val;
        else if (['pembelian', 'operasional', 'pajak'].includes(cat)) dailyMap[dateKey].pengeluaran += val;
    });

    const chartData = Object.keys(dailyMap).map(key => ({
        name: key,
        pemasukan: dailyMap[key].pemasukan,
        pengeluaran: dailyMap[key].pengeluaran
    }));

    return NextResponse.json({
        status, pesan, warna,
        metrics: {
            rasioLaba: rasioLaba.toFixed(1),
            cashFlow: cfMasuk - cfKeluar,
            saldo: saldoSaatIni
        },
        chartData
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}