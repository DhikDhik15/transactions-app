# Setup Neon Database untuk Development Lokal

## Langkah 1: Buat Akun Neon & Database

1. Buka https://neon.tech
2. Sign up dengan GitHub (pilih akun DhikDhik15)
3. Verify email
4. Create new project:
   - **Nama**: `transactions-app`
   - **Region**: `Singapore`
   - Klik "Create project"

## Langkah 2: Dapatkan Connection String

1. Di dashboard Neon, klik project `transactions-app`
2. Klik tab "Connect"
3. Pilih "Node.js" dari dropdown
4. Copy connection string (format: `postgresql://...`)

Contoh:
```
postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

## Langkah 3: Setup Environment Variable Lokal

1. Buka file `.env.local` di project root
2. Uncomment baris `DATABASE_URL=`
3. Paste connection string dari Neon

Hasil:
```env
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

4. Uncomment dan set `JWT_SECRET` dengan value random:
```env
JWT_SECRET=gK9bL2mP5qR8sT3uV6wX1yZ4aB7cD0eF
```

## Langkah 4: Install Dependencies & Setup

```bash
npm install
```

## Langkah 5: Run Migrations

```bash
npm run migrate
```

Jika belum ada script `migrate`, jalankan secara manual:
```bash
npx sequelize-cli db:migrate
```

## Langkah 6: Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- ✅ Pastikan `DATABASE_URL` sudah di-set di `.env.local`
- ✅ Pastikan connection string dari Neon sudah benar
- ✅ Cek apakah sudah ada jaringan internet (Neon butuh koneksi cloud)

### Error: "Database does not exist"
- ✅ Neon akan otomatis buat database
- ✅ Jalankan migrations: `npm run migrate`

### Error: "SSL connection error"
- ✅ Neon membutuhkan SSL (sudah di-config di `database.js`)
- ✅ Gunakan connection string yang include `?sslmode=require`

---

## Untuk Vercel Production

Saat deploy ke Vercel:

1. Buka Vercel dashboard
2. Pilih project `transactions-app`
3. Settings → Environment Variables
4. Tambahkan:
   - `DATABASE_URL`: (connection string dari Neon)
   - `JWT_SECRET`: (same value seperti local)

Vercel akan otomatis deploy ketika ada push ke main branch.

---

## Useful Commands

```bash
# Start dev server dengan hot-reload
npm run dev

# Run migrations
npm run migrate

# View database di Neon
# Buka https://neon.tech → Dashboard → Pilih project → SQL Editor

# Seed sample data
# Automatic saat first run jika SEED_SERVICES=true
```
