import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET: Ambil Semua Produk
export async function GET(req: NextRequest) {
  try {
    const produk = await prisma.produk.findMany({
      orderBy: { id_produk: 'desc' }
    });


    // KONVERSI PENTING:
    // Prisma BigInt & Decimal tidak bisa langsung jadi JSON. Kita harus ubah ke String/Number.
    const safeProduk = produk.map((item) => ({
      ...item,
      id_produk: item.id_produk.toString(), // BigInt -> String
      harga_pokok: Number(item.harga_pokok), // Decimal -> Number
      harga_jual: Number(item.harga_jual),   // Decimal -> Number
    }));


    return NextResponse.json(safeProduk, { status: 200 });
  } catch (error) {
    console.error("GET Inventaris Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}


// POST: Tambah Produk Baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nama_produk,
      kode_produk,
      stok_minimum,
      stok_saat_ini,
      satuan,
      harga_pokok
    } = body;


    // Validasi
    if (!nama_produk || !harga_pokok) {
      return NextResponse.json({ error: "Nama Produk dan Harga Pokok wajib diisi" }, { status: 400 });
    }


    const newProduk = await prisma.produk.create({
      data: {
        nama_produk,
        kode_produk: kode_produk || "-",
        stok_minimum: Number(stok_minimum) || 0,
        stok_saat_ini: Number(stok_saat_ini) || 0,
        satuan: satuan || "Pcs",
        harga_pokok: Number(harga_pokok),
        // Kita set harga jual sama dengan harga pokok dulu (default) agar tidak error
        harga_jual: Number(harga_pokok),
      },
    });


    // Konversi BigInt untuk respon
    const safeResponse = {
      ...newProduk,
      id_produk: newProduk.id_produk.toString(),
      harga_pokok: Number(newProduk.harga_pokok),
      harga_jual: Number(newProduk.harga_jual),
    };


    return NextResponse.json(safeResponse, { status: 201 });
  } catch (error) {
    console.error("POST Inventaris Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}
