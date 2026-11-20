# Smart Manufacturing Dashboard - PT Electrindo Inti Dinamika

Aplikasi web-based dashboard industri manufaktur modern untuk pemantauan performa mesin produksi secara real-time dan rekapitulasi laporan hasil produksi harian per shift kerja.

Proyek ini dibangun untuk memenuhi kualifikasi **Technical Test Fullstack Engineer PT Electrindo Inti Dinamika**.

---

## 1. Tech Stack & Arsitektur Sistem

- **Framework:** Next.js (App Router) Fullstack + TypeScript
- **Styling:** Tailwind CSS + Lucide React
- **Database & ORM:** PostgreSQL + Prisma ORM v6
- **Autentikasi:** JWT berbasis HTTP-Only Secure Cookie (`jose` + `bcryptjs`)
- **Pola Arsitektur:** Clean Architecture terstruktur berbasis lapisan teknis (*Layer-based Architecture*):
  - `src/repositories/`: Data Access Layer (interaksi langsung dengan Prisma Client & PostgreSQL).
  - `src/services/`: Business Logic Layer (penentuan shift otomatis, validasi input, agregasi laporan, kalkulasi telemetri).
  - `src/app/api/`: Presentation / Delivery Layer (REST API Endpoints).
  - `src/app/(dashboard)/`: Frontend Interface (Responsive Industrial UI).
  - `src/middleware.ts`: Gerbang proteksi rute global Next.js.

---

## 2. Fitur Utama (Sesuai Soal Seleksi)

1. **Autentikasi Pengguna:**
   - Sistem login aman dengan hashing password `bcryptjs`.
   - Penyimpanan sesi terproteksi menggunakan HTTP-Only Cookie untuk mencegah serangan XSS.
   - Proteksi rute otomatis via Next.js Middleware.

2. **Monitoring Produksi (Real-Time):**
   - Menampilkan performa 4 mesin industri utama: **CNC, Milling, Press, Assembly**.
   - Pemantauan metrik live per mesin:
     - Jumlah barang yang dihasilkan per menit (output/menit).
     - Status operasional: `Running`, `Idle`, `Maintenance`, `Error`.
     - Temperatur mesin dengan visualisasi batas termal normal hingga peringatan overheat.
     - Nama operator yang sedang bertugas.
   - Deteksi dan penandaan jam shift kerja aktif secara otomatis.
   - Ringkasan KPI pabrik terpusat (Total Unit, Mesin Beroperasi, Total Output, Rata-rata Suhu).

3. **Manajemen Data Mesin (CRUD):**
   - **Create:** Menambahkan unit mesin baru lengkap dengan kode unik, tipe, dan operator.
   - **Read:** Menampilkan katalog seluruh mesin dalam tabel interaktif.
   - **Update:** Pengubahan status cepat (*inline status change*) langsung dari tabel dan modal edit data.
   - **Delete:** Penghapusan unit mesin dari sistem.

4. **Laporan Produksi Harian per Shift:**
   - Rekapitulasi hasil kerja produksi harian.
   - Filter dinamis berdasarkan Tanggal dan Shift Kerja (`Shift 1`, `Shift 2`, `Shift 3`, atau `Semua Shift`).
   - Kartu agregasi: Total Hasil Produksi (pcs), Rata-rata Suhu Mesin, dan Total Log Record.
   - Rincian tabel riwayat produksi lengkap dengan stempel waktu, status mesin, dan operator bertugas.

---

## 3. Akun Demo Default

| Role | Email | Password |
|---|---|---|
| **Supervisor / Admin** | `admin@electrindo.id` | `password123` |

---

## 4. Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- Node.js versi 18+ atau 20+
- Database PostgreSQL yang aktif

### Langkah 1: Clone Repository & Install Dependencies
```bash
git clone <URL_REPOSITORY_ANDA>
cd eid_techinicaltest_rizki
npm install
```

### Langkah 2: Konfigurasi Environment Variable (`.env`)
Buat atau sesuaikan file `.env` di root direktori proyek:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/eid_manufacturing?schema=public"
JWT_SECRET="electrindo-secret-key-2026"
```

### Langkah 3: Sinkronisasi Skema Database & Jalankan Seeder
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronkan skema tabel ke PostgreSQL
npx prisma db push

# Isi data awal (demo user, 4 mesin awal, dan log produksi 3 shift)
npx prisma db seed
```

### Langkah 4: Jalankan Development Server
```bash
npm run dev
```
Buka browser di `http://localhost:3000` (atau port yang tertera di terminal).

---

## 5. Ringkasan Endpoint REST API

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/auth/login` | Otentikasi user & penanaman HTTP-Only Cookie |
| `POST` | `/api/auth/logout` | Menghapus sesi / membersihkan cookie |
| `GET` | `/api/auth/me` | Memeriksa data user yang sedang login |
| `GET` | `/api/machines` | Mengambil seluruh daftar mesin |
| `POST` | `/api/machines` | Menambahkan unit mesin baru |
| `GET` | `/api/machines/:id` | Mengambil detail mesin berdasarkan ID |
| `PUT` | `/api/machines/:id` | Memperbarui data/status mesin |
| `DELETE` | `/api/machines/:id` | Menghapus unit mesin |
| `GET` | `/api/monitoring/tick` | Membaca status live telemetri & shift aktif |
| `POST` | `/api/monitoring/tick` | Sinkronisasi telemetri berkala & pencatatan shift |
| `GET` | `/api/reports` | Mengambil rekapan laporan produksi per shift & tanggal |