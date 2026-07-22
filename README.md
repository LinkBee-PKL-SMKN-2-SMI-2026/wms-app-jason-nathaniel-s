# WMS (Warehouse Management System) - Training API

Repositori ini adalah fondasi untuk evaluasi teknis backend. Klien tidak peduli seberapa keras kamu berusaha; mereka hanya peduli apakah sistem berjalan dengan aman, cepat, dan tanpa bug.

## ⚠️ Aturan Main (Rules of Engagement)
Kegagalan mematuhi aturan di bawah ini berarti **Pull Request (PR) otomatis ditolak (Rejected)** tanpa perlu dibaca isinya.

1. **Dilarang keras melakukan PUSH ke `main`.**
   Semua pekerjaan dilakukan di branch terpisah dengan format: `feat/nama-fitur` atau `fix/nama-bug`.
2. **Atomic Commits.**
   Gunakan standar *Conventional Commits* (`feat: ...`, `fix: ...`, `chore: ...`). Jika ada commit dengan pesan "update" atau "beresin error", PR akan ditolak.
3. **Linter adalah Tuhan.**
   Jika GitHub Actions / Linter menunjukkan tanda silang merah, jangan pernah berani menekan tombol "Request Review". Tech Lead tidak akan membaca kode yang ditolak oleh mesin.
4. **Hukum Bertanya (The 3-Step Rule).**
   Dilarang mengirim pesan "Kak, ini error kenapa ya?". Jika kamu stuck, kamu hanya boleh bertanya jika menyertakan:
   - **Konteks:** "Saya sedang mencoba..."
   - **Aksi:** "Saya sudah mencoba solusi A, membaca dokumentasi B, dan mengubah C..."
   - **Bukti:** "Tapi log error di baris X menampilkan Y." (Sertakan screenshot / log).

## Tech Stack Wajib
- Bun (Runtime)
- Express 5 & TypeScript
- Prisma ORM (PostgreSQL)
- PostgreSQL (via Docker Compose)
- Pino (Logging)
- Zod (Input Validation)

## Prasyarat
- [Bun](https://bun.sh/) (`curl -fsSL https://bun.sh/install | bash`)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

## Getting Started

```bash
# 1. Clone repository
git clone <repo-url>
cd express-intern-backend-template

# 2. Install dependencies
bun install

# 3. Setup environment variable
cp .env.example .env

# 4. Jalankan PostgreSQL (Docker)
bun run db:up

# 5. Generate Prisma Client
bun run db:generate

# 6. Jalankan migrasi database
bun run db:migrate

# 7. Seed data (opsional)
bun run db:seed

# 8. Jalankan development server
bun run dev
```

Server akan berjalan di `http://localhost:3000`.

## Database Commands

| Command | Fungsi |
|---|---|
| `bun run db:up` | Start PostgreSQL container |
| `bun run db:down` | Stop & hapus container |
| `bun run db:logs` | Lihat logs container |
| `bun run db:restart` | Restart container |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Jalankan migration (dev) |
| `bun run db:migrate:prod` | Jalankan migration (production) |
| `bun run db:push` | Push schema ke DB tanpa migration |
| `bun run db:seed` | Seed data |
| `bun run db:studio` | Buka Prisma Studio (GUI) |
| `bun run db:reset` | Reset DB (drop + migrate + seed) |
| `bun run db:status` | Cek status migration |

## Available Scripts

| Command | Fungsi |
|---|---|
| `bun run dev` | Jalankan dev server dengan hot reload |
| `bun run start` | Jalankan server (production) |
| `bun run build` | Build ke `./dist` |
| `bun run lint` | Cek code quality dengan ESLint |
| `bun run lint:fix` | Auto-fix lint errors |

## Project Structure

```
src/
├── app/                    # Entry point Express
├── controllers/            # Route handlers
├── middlewares/             # Express middlewares
├── routes/                 # Route definitions
├── types/                  # TypeScript types & DTOs
├── utils/                  # Utility functions
├── validations/            # Zod schemas
└── generated/prisma/       # Prisma generated client (jangan di-edit)
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Database migrations
└── seed/                   # Seed data
```
