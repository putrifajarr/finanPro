import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idProdukBigInt = BigInt(params.id); // Convert String params ke BigInt


    await prisma.produk.delete({
      where: {
        id_produk: idProdukBigInt,
      },
    });


    return NextResponse.json({ message: "Produk dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
