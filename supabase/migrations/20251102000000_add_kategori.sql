-- ENUM kategori
CREATE TYPE nama_kategori AS ENUM ('operasional', 'penjualan', 'pembelian', 'pajak');

-- ENUM jenis transaksi (dipakai juga sebagai jenis kategori)
CREATE TYPE jenis_kategori AS ENUM ('pemasukan', 'pengeluaran');

-- Tabel kategori
CREATE TABLE kategori (
  id_kategori uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori nama_kategori NOT NULL,
  jenis_kategori jenis_kategori NOT NULL
);

-- Seeding kategori
INSERT INTO kategori (nama_kategori, jenis_kategori) VALUES
('penjualan', 'pemasukan'),
('pembelian', 'pengeluaran'),
('operasional', 'pengeluaran'),
('pajak', 'pengeluaran')
ON CONFLICT DO NOTHING;

-- Tabel transaksi
CREATE TABLE transaksi (
  id_transaksi uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL,
  id_kategori uuid REFERENCES kategori(id_kategori),
  total_harga numeric(15,2) NOT NULL,
  deskripsi text,
  jenis_transaksi jenis_kategori NOT NULL
);
