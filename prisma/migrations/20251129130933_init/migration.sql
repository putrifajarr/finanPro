-- CreateEnum
CREATE TYPE "nama_kategori" AS ENUM ('operasional', 'penjualan', 'pembelian', 'pajak');

-- CreateEnum
CREATE TYPE "jenis_kategori" AS ENUM ('pemasukan', 'pengeluaran');

-- CreateEnum
CREATE TYPE "jenis_hutang_piutang" AS ENUM ('hutang', 'piutang');

-- CreateEnum
CREATE TYPE "status_pembayaran" AS ENUM ('belum_lunas', 'lunas', 'dicicil');

-- CreateTable
CREATE TABLE "app_users" (
    "id_user" SERIAL NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "google_auth_id" TEXT,
    "status_verifikasi" BOOLEAN NOT NULL DEFAULT false,
    "tanggal_registrasi" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "job" TEXT,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id_kategori" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_kategori" "nama_kategori" NOT NULL,
    "jenis_kategori" "jenis_kategori" NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id_transaksi" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "total_harga" DOUBLE PRECISION NOT NULL,
    "deskripsi" TEXT,
    "id_kategori" UUID NOT NULL,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "transaksi_detail" (
    "id_detail" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "id_transaksi" UUID NOT NULL,
    "id_produk" BIGINT,
    "jumlah_barang" INTEGER,
    "harga_satuan" DECIMAL(65,30),
    "satuan" TEXT,
    "subtotal" DECIMAL(65,30),

    CONSTRAINT "transaksi_detail_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "hutang_piutang" (
    "id_hutang_piutang" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "nama_pihak" TEXT NOT NULL,
    "jenis_hutang_piutang" "jenis_hutang_piutang" NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL,
    "jatuh_tempo" TIMESTAMP(3),
    "status_pembayaran" "status_pembayaran" NOT NULL DEFAULT 'belum_lunas',

    CONSTRAINT "hutang_piutang_pkey" PRIMARY KEY ("id_hutang_piutang")
);

-- CreateTable
CREATE TABLE "produk" (
    "id_produk" BIGSERIAL NOT NULL,
    "nama_produk" VARCHAR(100) NOT NULL,
    "kode_produk" VARCHAR(50),
    "stok_minimum" INTEGER NOT NULL,
    "stok_saat_ini" INTEGER NOT NULL,
    "satuan" TEXT,
    "harga_pokok" DECIMAL(15,2) NOT NULL,
    "harga_jual" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id_produk")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_google_auth_id_key" ON "app_users"("google_auth_id");

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori"("id_kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_detail" ADD CONSTRAINT "transaksi_detail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_detail" ADD CONSTRAINT "transaksi_detail_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksi"("id_transaksi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_detail" ADD CONSTRAINT "transaksi_detail_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hutang_piutang" ADD CONSTRAINT "hutang_piutang_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
