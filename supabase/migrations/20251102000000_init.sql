
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nama_lengkap TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  googleId TEXT UNIQUE,
  tanggal_registrasi TIMESTAMP DEFAULT NOW()
);