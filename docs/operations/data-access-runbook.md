# Data & Access Foundation — Operator Runbook

Dokumen panduan operasional produksi untuk konfigurasi rahasia (secrets), validasi lingkungan, verifikasi otorisasi peran (*role-based access control*), pencadangan database, dan prosedur *rollback*.

---

## 1. Verifikasi Lingkungan Produksi (*Pre-flight Checks*)

Sebelum menjalankan atau me-restart layanan backend dan frontend di VPS, jalankan pemeriksaan integritas variabel lingkungan berikut:

```bash
# 1. Pastikan JWT_SECRET terisi dan BUKAN secret default repositori/contoh
test -n "$JWT_SECRET" && test "$JWT_SECRET" != "baznas_tangkot_super_secret_jwt_key_2026"

# 2. Periksa health endpoint backend lokal
curl -fsS http://127.0.0.1:3001/api/health

# 3. Periksa status proses PM2
pm2 status

# 4. Pencadangan database PostgreSQL sebelum deployment
pg_dump "$DATABASE_URL" > "baznas-$(date +%F).sql"
```

### Ketentuan Variabel Lingkungan Produksi:
- **`JWT_SECRET`**: Wajib diset string acak dengan entropi tinggi (minimal 32 karakter acak). Backend akan *fail-closed* (menolak start) jika `NODE_ENV=production` dan `JWT_SECRET` kosong atau memakai nilai default/contoh (`baznas_tangkot_super_secret_jwt_key_2026`, `change-me-in-production`, `development-only-jwt-secret`).
- **`FRONTEND_URL`**: Wajib diset origin resmi frontend (contoh: `https://tangkot.baznas.go.id`). Di mode produksi, CORS akan menolak browser origin tanpa konfigurasi ini.
- **`NEXT_PUBLIC_DEMO_MODE`**: **JANGAN** diset atau set ke string kosong/`false` di VPS produksi. Nilai `true` hanya diperuntukkan bagi demo offline lokal. Pada lingkungan produksi, sistem wajib menyajikan data operasional riil dan menampilkan status kosong (*empty state*) jujur bila belum ada transaksi tervalidasi.

---

## 2. Smoke Tests Otorisasi & Peran (*Role Smoke Tests*)

Lakukan pengujian cepat menggunakan `curl` untuk memastikan matriks akses berjalan sesuai kebijakan:

### A. Endpoint Publik
1. **Health Check (Publik, tanpa otentikasi):**
   ```bash
   curl -i http://127.0.0.1:3001/api/health
   # Ekspektasi: HTTP 200 OK (tanpa ekspos field cache_stats)
   ```
2. **Lacak Pengajuan (Publik, exact-match saja):**
   ```bash
   curl -i http://127.0.0.1:3001/api/public/lacak/MST-202609-0001
   # Ekspektasi: HTTP 200 dengan data tersanitasi (tanpa NIK lengkap, bank_account, dokumen internal)
   curl -i http://127.0.0.1:3001/api/public/lacak/1
   # Ekspektasi: HTTP 422 Unprocessable Entity (kueri terlalu pendek/underspecified)
   ```

### B. Endpoint Terproteksi
1. **Akses Anonim ke Data Mustahik:**
   ```bash
   curl -i http://127.0.0.1:3001/api/mustahik/export/data
   # Ekspektasi: HTTP 401 Unauthorized
   ```
2. **Ekspor Laporan Penyaluran:**
   ```bash
   # Anonim
   curl -i "http://127.0.0.1:3001/api/penyaluran/laporan/export/lap-1?format=json"
   # Ekspektasi: HTTP 401 Unauthorized

   # Dengan Bearer Token peran Penyaluran/Amil
   curl -i -H "Authorization: Bearer <TOKEN_AMIL>" "http://127.0.0.1:3001/api/penyaluran/laporan/export/lap-1?format=json"
   # Ekspektasi: HTTP 200 OK
   ```
3. **Mutasi PPD oleh Surveyor (Pembatasan Peran):**
   ```bash
   curl -i -X POST -H "Authorization: Bearer <TOKEN_SURVEYOR>" -H "Content-Type: application/json" \
     -d '{"approved_amount": 1000000}' http://127.0.0.1:3001/api/mustahik/1/ppd
   # Ekspektasi: HTTP 403 Forbidden (Surveyor tidak memiliki wewenang approval PPD)
   ```

---

## 3. Kebijakan Pencadangan & Retensi (*Backup & Retention*)

- **Perintah Backup Rutin:**
  ```bash
  pg_dump "$DATABASE_URL" | gzip > "/var/backups/baznas/baznas-$(date +%F_%H%M%S).sql.gz"
  ```
- **Jadwal Eksekusi:** Setiap hari pukul 02:00 WIB via cron sistem.
- **Kebijakan Retensi:**
  - Backup harian disimpan selama 30 hari.
  - Backup mingguan (hari Minggu) disimpan selama 12 minggu.
  - Backup bulanan (tanggal 1) disimpan selama 12 bulan.
- **Penanggung Jawab (*Retention Owner*):** Tim Infrastruktur IT / Lead DevOps BAZNAS Kota Tangerang.

---

## 4. Prosedur Rollback (*API & Frontend Rollback*)

Apabila ditemukan anomali kritis pasca-deploy:

1. **Identifikasi Commit SHA Sebelumnya:**
   ```bash
   cd /var/www/baznas-data-center
   git log -n 5 --oneline
   ```
2. **Rollback Source Code:**
   ```bash
   git checkout <PREVIOUS_COMMIT_SHA>
   ```
3. **Rebuild & Restart:**
   ```bash
   # Backend
   cd /var/www/baznas-data-center/server
   npm install --omit=dev
   pm2 restart baznas-api

   # Frontend
   cd /var/www/baznas-data-center/frontend-next
   npm install --omit=dev
   npm run build
   pm2 restart baznas-frontend
   ```
4. **Verifikasi Ulang Pasca-Rollback:**
   ```bash
   curl -fsS http://127.0.0.1:3001/api/health
   curl -fsS http://127.0.0.1:3000
   ```
