-- ENUM UNTUK KATEGORI
CREATE TYPE nama_kategori AS ENUM ('operasional', 'penjualan', 'pembelian', 'pajak');
CREATE TYPE jenis_kategori AS ENUM ('pemasukan', 'pengeluaran');

-- TABLE KATEGORI (ENUM FIX)
CREATE TABLE kategori (
  id_kategori uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kategori nama_kategori NOT NULL,
  jenis_kategori jenis_kategori NOT NULL
);

-- SEED KATEGORI DEFAULT
INSERT INTO kategori (nama_kategori, jenis_kategori) VALUES
('penjualan', 'pemasukan'),
('pembelian', 'pengeluaran'),
('operasional', 'pengeluaran'),
('pajak', 'pengeluaran')
ON CONFLICT DO NOTHING;


-- TABLE TRANSAKSI (MILIK USER)
CREATE TABLE transaksi (
  id_transaksi uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  id_kategori uuid REFERENCES kategori(id_kategori),
  total_harga numeric(15,2) NOT NULL,
  deskripsi TEXT
);

-- TABLE TRANSAKSI DETAIL (JIKA ADA PRODUK)
CREATE TABLE transaksi_detail (
  id_detail uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  id_transaksi uuid REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
  id_produk uuid REFERENCES produk(id_produk),
  jumlah_barang integer,
  harga_satuan numeric(15,2),
  satuan TEXT,               -- boleh beda, disimpan manual
  subtotal numeric(15,2)
);
