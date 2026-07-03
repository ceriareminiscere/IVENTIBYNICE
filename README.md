# Eventify — RESTful Event Management API

Eventify adalah RESTful Web Server berbasis **Node.js (Express 5) + MySQL (Sequelize ORM)**
untuk mengelola event/acara kampus: organisasi penyelenggara, ruangan, jadwal event,
dan pendaftaran peserta. Dilengkapi autentikasi JWT, otorisasi berbasis role & ownership,
serta update real-time (Socket.io) saat data event berubah.

## Fitur Utama

- **Autentikasi**: register/login dengan JWT, password di-hash dengan `bcrypt`.
- **Otorisasi**: middleware role-based (`admin` vs `member`) dan ownership-based
  (user hanya bisa mengubah datanya sendiri, kecuali admin).
- **CRUD** untuk 5 resource: Users, Organizations, Rooms, Events, Attendees.
- **Validasi input** terpusat (`express-validator`) + error handler global.
- **Pagination, sorting & filter/search** pada endpoint `GET /events`.
- **Real-time update (RTC)** via Socket.io — dashboard kalender otomatis
  refresh ke semua client yang sedang online saat ada event baru/diubah/dihapus,
  tanpa perlu reload halaman.
- Response JSON konsisten: `{ success, message?, data?, pagination? }`.

## Teknologi

| Kebutuhan | Teknologi |
|---|---|
| Runtime | Node.js (ESM / `"type": "module"`) |
| Framework | Express 5 |
| Database | MySQL (relasional) |
| ORM | Sequelize |
| Autentikasi | JSON Web Token (`jsonwebtoken`) + `bcrypt` |
| Validasi | `express-validator` |
| Real-time | `socket.io` |
| Dev tool | `nodemon` |

## Struktur Folder

```
Project-Eventify/
├── app.js                  # entry point, setup express + socket.io + koneksi DB
├── config/database.js      # koneksi Sequelize ke MySQL
├── models/                 # User, Organization, Room, Event, Attendee
├── controllers/            # logic tiap resource
├── routes/                 # definisi endpoint + middleware per rute
├── middleware/
│   ├── authMiddleware.js   # verifikasi JWT
│   ├── roleMiddleware.js   # otorisasi role & ownership
│   ├── validation.js       # penanganan hasil express-validator
│   └── errorHandler.js     # error handler global
├── public/                 # frontend statis (dashboard, login)
├── .env.example
└── package.json
```

## ERD (Entity Relationship)

```
Organization (1) ───< (N) Event (N) >─── (1) Room
                              │
                              │ (1)
                              ▼
                            (N) Attendee

User  →  independen (untuk autentikasi & manajemen akun)
```

- `Organization.hasMany(Event)` — satu organisasi bisa punya banyak event.
- `Room.hasMany(Event)` — satu ruangan bisa dipakai banyak event (waktu berbeda).
- `Event.hasMany(Attendee)` — satu event bisa punya banyak peserta.
- `User` menyimpan akun (role: `admin` / `member`) untuk login & otorisasi.

## Setup & Menjalankan

1. Clone/extract project, lalu install dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env` dan sesuaikan kredensial database:
   ```bash
   cp .env.example .env
   ```
3. Buat database MySQL kosong sesuai nama di `.env` (`DB_NAME`), contoh:
   ```sql
   CREATE DATABASE eventify_db;
   ```
4. Jalankan server (development, auto-reload):
   ```bash
   npm run dev
   ```
   atau untuk production:
   ```bash
   npm start
   ```
5. Server berjalan di `http://localhost:3000` (sesuai `PORT` di `.env`).
   Tabel-tabel akan otomatis ter-sync oleh Sequelize saat pertama kali start.

## Autentikasi

Semua endpoint yang dilindungi butuh header:
```
Authorization: Bearer <token>
```
Token didapat dari response `POST /auth/login`.

## Daftar Endpoint API

### Auth (`/auth`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | Publik | Daftar akun baru (password di-hash) |
| POST | `/auth/login` | Publik | Login, mengembalikan JWT + data user |
| GET  | `/auth/profile` | Login | Ambil data profil dari token |

### Users (`/users`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/users` | Admin | Daftar seluruh user |
| PUT | `/users/:id` | Pemilik akun atau Admin | Ubah profil (bisa ganti password) |
| DELETE | `/users/:id` | Admin | Hapus akun user |

### Events (`/events`)
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/events?page=&limit=&sort=&order=&title=` | Publik | List event + pagination/filter/sort |
| GET | `/events/:id` | Publik | Detail satu event |
| POST | `/events` | Admin | Buat event baru (emit `eventCreated`) |
| PUT | `/events/:id` | Admin | Ubah event (emit `eventUpdated`) |
| DELETE | `/events/:id` | Admin | Hapus event (emit `eventDeleted`) |

### Organizations (`/organizations`)
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/organizations` | Publik |
| POST | `/organizations` | Admin |
| PUT | `/organizations/:id` | Admin |
| DELETE | `/organizations/:id` | Admin |

### Rooms (`/rooms`)
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/rooms` | Publik |
| POST | `/rooms` | Admin |
| PUT | `/rooms/:id` | Admin |
| DELETE | `/rooms/:id` | Admin |

### Attendees (`/attendees`)
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/attendees` | Publik |
| POST | `/attendees` | Login (user manapun bisa daftar) |
| PUT | `/attendees/:id` | Admin |
| DELETE | `/attendees/:id` | Admin |

## Real-time (RTC)

Server meng-emit event Socket.io berikut setiap ada perubahan data Event:
`eventCreated`, `eventUpdated`, `eventDeleted`. Frontend (`public/js/main.js`)
mendengarkan ketiganya dan otomatis me-refresh kalender + menampilkan notifikasi
toast di semua browser yang sedang membuka dashboard, tanpa reload manual.

## Pengujian

Direkomendasikan menguji seluruh endpoint di atas dengan Postman/Newman
(50–200 request, concurrency 5–20) sebelum deployment, sesuai instruksi tugas.
Simpan file collection Postman (`.json`) dan sertakan pada folder pengumpulan.

## Deployment

_(Isi setelah deploy)_ — Link hosting, platform (Render/Railway/Fly.io/dll),
serta environment variable yang perlu diset di dashboard hosting.
