# Personal Money Tracker

Aplikasi pencatat keuangan pribadi berbasis web dengan desain **neubrutalism**. Dibangun sebagai monolith menggunakan Nuxt 4.

## Fitur

- **Kategori Pengeluaran & Pemasukan** — kelola kategori transaksi dengan warna masing-masing
- **Multiple Wallet** — catat saldo di beberapa tempat (tunai, bank, e-wallet, dll), saldo dihitung otomatis dari histori transaksi
- **Transfer Antar Wallet** — pindahkan saldo antar wallet tanpa tercatat sebagai income/expense
- **Transaksi** — catat, edit, hapus transaksi income/expense, dengan pagination
- **Home** — ringkasan total pemasukan, pengeluaran, dan saldo akhir (dihitung di server) + transaksi terbaru
- **Laporan** — breakdown pengeluaran & pemasukan per kategori, filter per bulan
- **Auth sederhana** — satu password untuk melindungi akses (single user)

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3 + TypeScript) |
| Database | SQLite lokal via [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Styling | Tailwind CSS v4 (custom neubrutalism tokens) |
| State management | Pinia |
| Validasi | Zod |
| Chart | Chart.js (vue-chartjs) |
| Testing | Vitest |

## Setup

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Salin file environment

   ```bash
   cp .env.example .env
   ```

   Lalu sesuaikan isinya:

   | Variable | Keterangan |
   |---|---|
   | `AUTH_PASSWORD` | Password untuk login ke aplikasi |
   | `SESSION_PASSWORD` | Secret untuk enkripsi session cookie (minimal 32 karakter) |
   | `DATABASE_URL` | Lokasi file database SQLite, default `file:./data/db.sqlite` |

3. Jalankan migration database

   ```bash
   pnpm db:migrate
   ```

4. (Opsional) isi data contoh

   ```bash
   pnpm db:seed
   ```

5. Jalankan development server

   ```bash
   pnpm dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Script yang Tersedia

| Script | Keterangan |
|---|---|
| `pnpm dev` | Jalankan development server |
| `pnpm build` | Build untuk production |
| `pnpm preview` | Preview hasil build |
| `pnpm test` | Jalankan unit test (Vitest) |
| `pnpm db:generate` | Generate file migration baru dari schema |
| `pnpm db:migrate` | Terapkan migration ke database |
| `pnpm db:push` | Push schema langsung ke database (tanpa file migration) |
| `pnpm db:seed` | Isi database dengan data contoh |

## Struktur Project

```
app/
├── pages/          # Halaman: home, wallets, categories, transactions, transfers, report
├── components/     # Komponen UI neubrutalism (Brutal*) & form modal
├── stores/         # Pinia store (wallets, categories, transactions, transfers)
├── composables/    # Composable (mis. useApi untuk fetch dengan cookie forwarding di SSR)
└── layouts/        # Layout default & auth

server/
├── api/            # API routes (Nitro)
├── db/             # Schema & client Drizzle
├── middleware/     # Middleware auth untuk proteksi API
└── utils/          # Helper (auth session, kalkulasi saldo)

drizzle/            # File migration SQL
tests/              # Unit test
```

## Deployment

Aplikasi ini berjalan sebagai satu proses Node (monolith), bisa di-deploy ke:

- **VPS/Docker** — build dengan `pnpm build`, jalankan `.output/server/index.mjs`, pastikan volume persistent untuk folder `data/` (file SQLite)
- **Platform serverless** (Vercel, dll) — perlu ganti `DATABASE_URL` ke database eksternal (mis. [Turso](https://turso.tech)) karena SQLite lokal tidak persistent di environment serverless
