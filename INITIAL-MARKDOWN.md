# Personal Money Tracker — Catatan Project

Dokumen ini merangkum seluruh keputusan, fitur, dan aturan yang sudah diterapkan di project ini selama proses development. Berfungsi sebagai referensi supaya konteks tidak hilang.

Repo: https://github.com/maeruuuuu/personal-money-tracker (branch `main`)

---

## 1. Ringkasan Project

Aplikasi money tracker berbasis web untuk **single user**, dengan desain **neubrutalism**, dibangun sebagai **monolith** (bukan microservices).

## 2. Tech Stack & Alasan

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Nuxt 4 (Vue 3 + TypeScript) | Monolith: UI + API (`server/api/*`) satu codebase, satu proses |
| Database | SQLite via `@libsql/client` | Awalnya pakai `better-sqlite3`, **diganti** karena butuh kompilasi native (node-gyp + Visual Studio Build Tools) yang tidak tersedia di mesin dev (Windows). `@libsql/client` pakai prebuilt binary, jalan langsung tanpa compiler |
| ORM | Drizzle ORM | TypeScript-first, migration jelas via `drizzle-kit` |
| Styling | Tailwind CSS v4 | Custom design token neubrutalism via `@theme` dan `@utility` (bukan `@layer components`, karena Tailwind v4 tidak izinkan `@apply` ke class biasa — harus didefinisikan sebagai `@utility` supaya bisa di-`@apply`) |
| State management | Pinia | Store per domain: `wallets`, `categories`, `transactions`, `transfers` |
| Validasi | Zod | Validasi body di semua API route |
| Auth | Session cookie (h3 `useSession`) | Single password di `.env` (`AUTH_PASSWORD`), tanpa sistem register. Session di-encrypt pakai `SESSION_PASSWORD` (min 32 karakter) |
| Chart | Chart.js (`vue-chartjs`) | Dipakai di halaman Laporan (doughnut chart pengeluaran per kategori) |
| Package manager | pnpm | — |
| Testing | Vitest | Unit test untuk kalkulasi saldo (`tests/balance.test.ts`) |

### Catatan teknis penting
- **pnpm build scripts**: `pnpm-workspace.yaml` berisi `onlyBuiltDependencies: [esbuild]` — perlu di-approve manual karena default pnpm block native build scripts.
- **SSR cookie forwarding**: `$fetch` global di Nuxt **tidak** otomatis forward cookie request saat SSR. Semua pemanggilan API dari Pinia store pakai composable `useApi()` (wrapper `useRequestFetch()`), bukan `$fetch` langsung — supaya session cookie ikut terkirim saat komponen di-render di server.
- **Komponen custom harus flat**: komponen di `app/components/ui/*.vue` awalnya tidak ke-resolve (`<BrutalButton>` gagal) karena Nuxt otomatis kasih prefix folder (`<UiBrutalButton>`). Solusinya: semua komponen custom (`Brutal*.vue`, `TransactionFormModal.vue`, `TransferFormModal.vue`) diletakkan **langsung di `app/components/`**, bukan di subfolder.
- **Nuxt 4 struktur**: `pages/`, `components/`, `stores/`, `composables/`, `layouts/`, `middleware/` semua di dalam `app/`. `server/` tetap di root.

## 3. Skema Database (`server/db/schema.ts`)

- **wallets**: `id, name, type (cash/bank/ewallet/other), initialBalance, color, createdAt`
- **categories**: `id, name, type (income/expense), color, createdAt`
- **transactions**: `id, walletId (FK→wallets, cascade), categoryId (FK→categories, restrict), type (income/expense), amount, note, date, createdAt`
- **transfers**: `id, fromWalletId (FK→wallets, cascade), toWalletId (FK→wallets, cascade), amount, note, date, createdAt`

**Aturan saldo wallet** (`server/utils/balance.ts`):
```
balance = initialBalance + Σincome - Σexpense + Σtransfer_in - Σtransfer_out
```
Dihitung on-the-fly, bukan kolom yang di-update manual.

**Aturan summary** (`GET /api/summary`, dihitung di server via SQL `SUM()`):
```
totalIncome  = SUM(transactions.amount WHERE type='income')
totalExpense = SUM(transactions.amount WHERE type='expense')
totalBalance = SUM(wallets.initialBalance) + totalIncome - totalExpense
```
Transfer **tidak** mempengaruhi `totalBalance` di level agregat karena setiap transfer punya satu sisi keluar dan satu sisi masuk yang saling menghilangkan saat dijumlah ke semua wallet.

## 4. Fitur yang Sudah Diimplementasikan

### Kategori Pengeluaran & Pemasukan (`/categories`)
- CRUD lengkap, tab filter Pengeluaran/Pemasukan
- Hapus kategori yang masih dipakai transaksi → ditolak (400) dengan pesan jelas (FK `restrict`)

### Multiple Wallet (`/wallets`)
- CRUD lengkap, saldo dihitung otomatis (bukan input manual)
- Hapus wallet → cascade hapus transaksi & transfer terkait

### Transfer Antar Wallet (`/transfers`)
- Form dari-wallet / ke-wallet, validasi wallet asal ≠ tujuan
- Tidak tercatat sebagai income/expense, tapi mempengaruhi saldo kedua wallet

### Transaksi (`/transactions`)
- CRUD lengkap termasuk **edit** (`TransactionFormModal.vue` mode create/edit via prop `transaction`)
- **Pagination server-side**: `GET /api/transactions?page=&pageSize=` return `{ items, total, page, pageSize, totalPages }`. Tanpa query `page`, endpoint tetap return array biasa (backward-compatible untuk kebutuhan agregasi)
- pageSize berbeda per konteks: 20 di halaman Transaksi, 5 di widget "Transaksi Terbaru" pada Home — masing-masing pass `pageSize` eksplisit supaya tidak saling kontaminasi state di store yang sama

### Home (`/`)
- 3 kartu ringkasan: **Total Pemasukan / Total Pengeluaran / Saldo Akhir** — nilainya dari `GET /api/summary` (server-side aggregation), bukan hitung manual di client
- Tombol aksi cepat: **+ Tambah Transaksi** dan **+ Transfer** (modal reusable, sama dengan yang dipakai di halaman masing-masing)
- Widget "Transaksi Terbaru" dengan pagination (5/halaman)
- **Tidak** menampilkan grid semua wallet (dipindah cukup ke halaman `/wallets`)

### Laporan (`/report`)
- Filter bulan (`<input type="month">`), default ke bulan berjalan
- Chart doughnut "Pengeluaran per Kategori" (ter-filter sesuai bulan dipilih)
- List "Rincian Pengeluaran" dan "Rincian Pemasukan" per kategori, terurut dari total terbesar
- Halaman ini masih fetch semua transaksi (`fetch()`, bukan `fetchPage()`) karena butuh grouping per kategori & bulan — belum di-agregasi di server (potensi improvement kalau data sudah besar)

### Auth
- Single password di `.env` (`AUTH_PASSWORD`)
- Session cookie ter-enkripsi (`SESSION_PASSWORD`), via `server/utils/auth.ts` + `server/middleware/auth.ts` (proteksi semua `/api/*` kecuali `/api/auth/login` & `/api/auth/me`)
- Client-side guard: `app/middleware/auth.global.ts` redirect ke `/login` kalau belum login

## 5. Desain Neubrutalism (`app/assets/css/main.css`)

- Border tebal hitam solid 3px (`brutal-border`)
- Hard shadow offset tanpa blur: `brutal-shadow` (5px) / `brutal-shadow-sm` (3px)
- Efek "press" saat tombol diklik: shadow hilang + geser 3px (`brutal-press`)
- Warna flat kontras tinggi: `brutal-yellow`, `brutal-pink`, `brutal-blue`, `brutal-green`, `brutal-red`, `brutal-purple`
- Tanpa border-radius, tipografi bold/heavy untuk heading
- Komponen dasar reusable: `BrutalButton`, `BrutalCard`, `BrutalInput`, `BrutalSelect`, `BrutalBadge`, `BrutalModal` — semua di `app/components/` (flat, lihat catatan teknis di atas)

## 6. Struktur Store (Pinia)

Pola konsisten di semua store (`app/stores/*.ts`):
- Action CRUD (`create`, `update`, `remove`) selalu refresh data terkait setelahnya (termasuk store lain yang terpengaruh, mis. `transactionsStore` refresh `walletsStore` juga karena saldo berubah)
- `transactionsStore` punya 3 mode data terpisah:
  - `items` — full list, dipakai Laporan (`fetch()`)
  - `pageItems` + `pageNumber/pageSize/pageTotal/pageTotalPages` — dipakai halaman Transaksi & widget Home (`fetchPage()`)
  - `summary` — total income/expense/balance dari server (`fetchSummary()`)
  - `refresh()` dipanggil setelah create/update/delete: selalu refresh summary + wallets, dan refresh halaman aktif kalau `paginationActive`

## 7. Environment Variables (`.env`)

| Variable | Keterangan |
|---|---|
| `AUTH_PASSWORD` | Password login (dev default: `changeme`, **wajib diganti** untuk production) |
| `SESSION_PASSWORD` | Secret enkripsi session, min 32 karakter |
| `DATABASE_URL` | `file:./data/db.sqlite` untuk lokal, bisa diarahkan ke Turso/libSQL remote untuk deploy serverless |

## 8. Script

Lihat `README.md` untuk daftar lengkap (`pnpm dev`, `db:generate`, `db:migrate`, `db:seed`, `test`, dll).

## 9. Belum Diimplementasikan (potensi improvement)

- Agregasi kategori per bulan di Laporan masih fetch semua data di client (belum server-side seperti summary Home)
- Filter/pencarian transaksi (misal per wallet, per kategori, per rentang tanggal) di halaman Transaksi
- Export data (CSV/PDF)
- Multi-user / role akses
