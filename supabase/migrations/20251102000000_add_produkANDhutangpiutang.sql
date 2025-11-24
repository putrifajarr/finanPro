
-- TABLE PRODUK (MILIK USER)
CREATE TABLE produk (
  id_produk uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  nama_produk TEXT NOT NULL,
  kode_produk TEXT,
  stok_minimum INTEGER DEFAULT 0,
  stok_saat_ini INTEGER DEFAULT 0,
  satuan TEXT NOT NULL,
  harga_pokok numeric(15,2),
  harga_jual numeric(15,2)
);

-- ENUM & TABLE HUTANG PIUTANG
CREATE TYPE jenis_hutang_piutang AS ENUM ('hutang', 'piutang');
CREATE TYPE status_pembayaran AS ENUM ('belum lunas', 'lunas', 'dicicil');

CREATE TABLE hutang_piutang (
  id_hutang_piutang uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  nama_pihak TEXT NOT NULL,
  jenis_hutang_piutang jenis_hutang_piutang NOT NULL,
  jumlah numeric(15,2) NOT NULL,
  jatuh_tempo DATE,
  status_pembayaran status_pembayaran DEFAULT 'belum lunas'
);
