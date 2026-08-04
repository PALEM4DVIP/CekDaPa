# Rankline — Bulk Open PageRank Checker

Aplikasi web untuk mengecek Open PageRank hingga 100 domain sekaligus, dengan
progress bar, statistik instan, pencarian & filter, export CSV/Excel, salin ke
clipboard, dan mode gelap/terang. Dibangun dengan Next.js 14 (App Router) +
Tailwind CSS, siap deploy ke Vercel.

## Fitur

- Cek hingga 100 domain sekaligus (dikirim dalam beberapa batch kecil ke API
  agar progress bar terlihat berjalan)
- Progress bar real-time selama proses pengecekan
- Export hasil ke CSV dan Excel (.xlsx)
- Pencarian domain + filter status (Semua / OK / Error)
- Sortir kolom (Domain, PageRank, Rank Global)
- Salin hasil ke clipboard (format tab-separated, siap tempel ke spreadsheet)
- Mode gelap / terang, tersimpan otomatis di browser
- Statistik: rata-rata OPR, domain tertinggi, domain terendah, jumlah diproses
- API key OpenPageRank disimpan aman di server (route handler), tidak
  pernah dikirim ke browser

## 1. Dapatkan API key OpenPageRank

OpenPageRank kini berjalan di bawah platform Keywords Everywhere, dengan API
key format baru (`opr_live_...`). Key lama dari domcop.com **tidak berlaku
lagi** di endpoint baru.

1. Buka https://openpagerank.keywordseverywhere.com/dashboard
2. Masuk/daftar dengan akun Keywords Everywhere.
3. Buat API key baru dari dashboard (diawali `opr_live_`).
4. Batas tier gratis: kuota bulanan (bukan harian) domain, maksimal 100
   domain unik per permintaan — sudah sesuai dengan batas 100 domain pada
   aplikasi ini. Cek sisa kuota kapan saja lewat endpoint `/v1/usage` di
   dashboard mereka.

## 2. Jalankan secara lokal

```bash
npm install
cp .env.example .env.local
# lalu isi OPENPAGERANK_API_KEY di .env.local
npm run dev
```

Buka http://localhost:3000

## 3. Deploy ke Vercel

### Opsi A — lewat Vercel CLI

```bash
npm install -g vercel
vercel
```

Ikuti instruksi, lalu tambahkan environment variable saat diminta, atau lewat
dashboard (lihat Opsi B, langkah 3).

### Opsi B — lewat dashboard Vercel

1. Push folder ini ke repository GitHub/GitLab/Bitbucket.
2. Di https://vercel.com, klik **Add New → Project**, lalu pilih repo
   tersebut.
3. Buka **Project Settings → Environment Variables**, tambahkan:
   - `OPENPAGERANK_API_KEY` = API key Anda dari
     openpagerank.keywordseverywhere.com/dashboard (isi untuk Production,
     Preview, dan Development)
4. Klik **Deploy**.

Vercel otomatis mendeteksi ini sebagai proyek Next.js — tidak perlu
konfigurasi build tambahan.

## Struktur proyek

```
app/
  api/check-domains/route.ts   # Proxy server-side ke OpenPageRank API
  page.tsx                     # Halaman utama aplikasi
  layout.tsx                   # Root layout, font, dan setup dark mode
  globals.css
components/
  DomainInput.tsx              # Input daftar domain
  ResultsTable.tsx             # Tabel hasil + cari/filter/sortir/export
  StatsCards.tsx               # Kartu statistik + gauge
  ThemeToggle.tsx              # Tombol mode gelap/terang
lib/
  export.ts                    # Helper export CSV/Excel/clipboard
  types.ts
```

## Catatan

- Batas 100 domain per pengecekan mengikuti batas API OpenPageRank per
  permintaan. Untuk memeriksa lebih dari 100 domain, jalankan pengecekan
  beberapa kali dan gabungkan hasil ekspornya.
- Domain otomatis dibersihkan dari `http://`, `https://`, `www.`, dan path —
  cukup masukkan nama domain polos (mis. `contoh.com`).
