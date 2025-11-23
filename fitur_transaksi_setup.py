import sqlite3

conn = sqlite3.connect('finanPro.db')
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT NOT NULL,
    produk TEXT NOT NULL,
    jumlah INTEGER NOT NULL,
    harga REAL NOT NULL
)
''')

conn.commit()
conn.close()
print("Database dan tabel transaksi berhasil dibuat!")
