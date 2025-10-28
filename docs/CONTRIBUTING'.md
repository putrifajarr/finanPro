````markdown
# 🤝 Panduan Kontribusi – FinanPro Team

Selamat datang di proyek **FinanPro Web App** 🎉  
Panduan ini dibuat agar seluruh anggota tim (Frontend & Backend) dapat berkolaborasi secara **konsisten, rapi, dan efisien** menggunakan Git & GitHub.

---

## 🧭 1. Setup Awal

1. **Clone repository:**
   ```bash
   git clone https://github.com/putrifajarr/finanPro.git
   cd finanPro
````

2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Buat file environment (jika dibutuhkan):**

   ```bash
   cp .env.example .env
   ```

---

## 🌿 2. Struktur Branch

Kita menggunakan pola branch seperti berikut:

| Branch        | Tujuan                                        | Siapa yang Gunakan |
| ------------- | --------------------------------------------- | ------------------ |
| `main`        | Branch utama untuk versi stabil / siap deploy | Putri              |
| `develop`     | Branch aktif pengembangan (base semua fitur)  | Semua anggota      |
| `feature/...` | Branch untuk fitur baru                       | Semua anggota      |
| `docs/...`    | Branch dokumentasi / panduan                  | Semua anggota      |

---

## 🪄 3. Penamaan Branch

Gunakan format:

```
feature/<kategori>-<nama-fitur>
```

### 💡 Contoh:

| Kategori      | Nama Branch             | Tujuan                    |
| ------------- | ----------------------- | ------------------------- |
| UI (Frontend) | `feature/ui-login`      | Halaman login & register  |
| API (Backend) | `feature/api-transaksi` | Endpoint transaksi        |
| UI            | `feature/ui-dashboard`  | Dashboard utama           |
| Docs          | `docs/setup-guide`      | Panduan setup      |

> ⚠️ Gunakan huruf kecil semua, pisahkan dengan tanda `-`, tanpa spasi.

---

## 🔁 4. Alur Kerja Git (Langkah demi Langkah)

### 🔹 A. Pastikan Kamu di Branch `develop`

```bash
git checkout develop
git pull origin develop
```

### 🔹 B. Buat Branch Fitur Baru

```bash
git checkout -b feature/'nama fitur'
```

### 🔹 C. Kerjakan Fitur Kamu

Edit, tambahkan, atau ubah file yang diperlukan sesuai fitur kamu.

### 🔹 D. Simpan Perubahan (Commit)

Tambahkan file ke staging area:

```bash
git add .
```

Commit dengan pesan yang jelas:

```bash
git commit -m "Add dashboard layout and statistic cards"
```

**Tips menulis pesan commit:**

* ✅ `"Add login form validation"`
* ✅ `"Fix API route for updating transaction"`
* ❌ `"update code"`
* ❌ `"fix something"`

### 🔹 E. Upload Branch ke GitHub

```bash
git push origin feature/"(nama fitur)"
```

---

## ⚔️ 5. Jika Terjadi Konflik (Conflict)

1. Git akan menandai bagian konflik dengan tanda seperti:

   ```
   <<<<<<< HEAD
   kode versi lokal
   =======
   kode versi remote
   >>>>>>> develop
   ```
2. Pilih versi yang benar, hapus tanda-tanda konflik.
3. Setelah diperbaiki:

   ```bash
   git add .
   git commit -m "Resolve merge conflict in dashboard page"
   ```

---

## 🧹 6. Checklist Sebelum Push

Pastikan kamu sudah:

* [ ] Berada di branch fitur yang benar
* [ ] Menjalankan `npm run dev` tanpa error
* [ ] Commit dengan pesan yang jelas
* [ ] Pull update terbaru dari `develop`
* [ ] Fitur berjalan normal di lokal

---

## 🧠 7. Tips Kolaborasi Tim

💬 **Jangan bekerja langsung di `main` atau `develop`.**
🌿 Gunakan branch fitur agar aman dan mudah direview.
📥 Sering lakukan `git pull origin develop` supaya selalu update.
🪄 Gunakan PR untuk review antar tim agar tidak bentrok.
📝 Update checklist README kalau fiturmu sudah selesai.
🎯 Satu branch = satu fitur → agar mudah dikelola.

---