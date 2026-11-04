# Tender Management Dashboard

Panduan instalasi dan menjalankan aplikasi Tender Management Dashboard.

---

## Prasyarat

Pastikan perangkat Anda sudah terinstal:

- **Node.js**: Versi `>= 20.x` (disarankan LTS)
- **NPM**: Versi `>= 10.x` (bawaan Node.js)

Periksa versi Node.js dan NPM Anda:

```bash
node -v
npm -v
```

---

## Panduan Instalasi Lokal

### 1. Masuk ke Direktori Proyek

Buka terminal dan arahkan ke folder proyek:

```bash
cd app-tender-management
```

### 2. Install Dependensi

Jalankan perintah berikut untuk mengunduh seluruh dependensi:

```bash
npm install
```

### 3. Menjalankan Server Pengembangan

Jalankan aplikasi dalam mode development:

```bash
npm run dev
```

Buka peramban (browser) dan akses:

```
http://localhost:3000
```

---

## Perintah yang Tersedia (NPM Scripts)

| Perintah        | Deskripsi                                                  |
| --------------- | ---------------------------------------------------------- |
| `npm run dev`   | Menjalankan server pengembangan di `http://localhost:3000` |
| `npm run build` | Membuat build produksi aplikasi yang teroptimasi           |
| `npm start`     | Menjalankan build produksi secara lokal                    |
| `npm run lint`  | Menjalankan pemeriksaan kode menggunakan ESLint            |
| `npm test`      | Menjalankan pengujian unit dengan Vitest                   |

---

## Struktur Folder Singkat

```
app-tender/
├── app/               # Next.js App Router (halaman, layout, API route)
├── components/        # Komponen UI reusable & fitur tender
├── hooks/             # Custom React hooks (fetching, debounce, trap fokus)
├── lib/               # Utility functions (format, filter, client API)
├── mocks/             # Data mock dokumen tender
├── store/             # State management Zustand & safe storage
├── types/             # Definisi TypeScript interface & type
└── __tests__/         # Pengujian unit (Vitest)
```
