# Setup Aplikasi dengan Neon (PostgreSQL)

Aplikasi ini sudah dikonfigurasi untuk menggunakan **Neon** sebagai database gratis di production.

## Langkah-Langkah Setup

### 1. Daftar Neon
1. Buka https://neon.tech
2. Klik "Sign up"
3. Login dengan GitHub (DhikDhik15)
4. Verifikasi email
5. Skip onboarding jika ditanya

### 2. Buat Project Database di Neon
```
1. Dashboard Neon → Klik "Create Project"
2. Nama project: transactions-app
3. Region: Singapore (ap-southeast-1) — pilih yang terdekat
4. Klik "Create project"
```

### 3. Dapatkan Connection String
```
1. Masuk ke project: transactions-app
2. Klik "Connection Details" atau "Connection string"
3. Pilih "Node.js" dari dropdown
4. Copy entire connection string (mulai dari postgresql://...)
```

**Contoh connection string:**
```
postgresql://neon_user:pscale_pw_xxxxx@ep-xxx.ap-southeast-1.aws.neon.tech/transactions-app?sslmode=require
```

### 4. Setup di Vercel
```
1. Buka https://vercel.com
2. Dashboard → Pilih project: transactions-app
3. Masuk ke "Settings" → Tab "Environment Variables"
4. Tambahkan variable baru:
   
   NAME: DATABASE_URL
   VALUE: (paste connection string dari Neon)
   
5. Production environment (pilih Production)
6. Klik "Save"
```

### 5. Tambah Variable Lainnya
Masih di Environment Variables, tambahkan:

```
JWT_SECRET = (buat random string, bisa copy dari: https://generate-secret.vercel.app/)
JWT_EXPIRES_IN = 12h
DB_TIMEZONE = +07:00
DB_LOGGING = false
```

### 6. Push ke GitHub
```bash
git add .
git commit -m "Setup PostgreSQL with Neon"
git push origin main
```

Vercel akan **auto-deploy** ketika code di-push.

### 7. Jalankan Migrations (PENTING!)
Setelah deploy berhasil, jalankan migrations di production:

**Option A: Via Vercel CLI**
```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull

# Jalankan migrations
npm run migrate
```

**Option B: Via SSH/Server**
```bash
ssh user@your-vercel-server
cd /path/to/transactions-app
npm install
npm run migrate
```

## Local Development (Opsional)

Jika ingin develop lokal dengan PostgreSQL:

### Install PostgreSQL Lokal
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows: Download dari https://www.postgresql.org/download/windows/
```

### Setup Database Lokal
```bash
# Login ke PostgreSQL
psql -U postgres

# Jalankan di psql:
CREATE DATABASE transactions_app;
\q
```

### Setup .env.local
```
DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/transactions_app

# Atau gunakan individual env vars:
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=transactions_app
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_random_secret
JWT_EXPIRES_IN=12h
DB_TIMEZONE=+07:00
```

### Jalankan Migrations Lokal
```bash
npm run migrate
```

### Start Development Server
```bash
npm run dev
```

## Test Connection

Untuk test apakah connection ke Neon berhasil:

```bash
# Via Neon Web Console
# 1. Dashboard → transactions-app
# 2. Klik tab "Tables"
# 3. Jalankan query: SELECT 1;

# Via Node.js
node -e "
require('dotenv').config();
const { Sequelize } = require('sequelize');
const seq = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' });
seq.authenticate()
  .then(() => console.log('✓ Connection OK'))
  .catch(err => console.error('✗ Connection failed:', err.message));
"
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Pastikan CONNECTION_STRING sudah benar di Vercel
- Check di Neon dashboard apakah database masih active
- Restart Vercel deployment

### Error: "relation 'users' does not exist"
- Migrations belum dijalankan
- Jalankan: `npm run migrate`

### Error: "SSL certificate problem"
- Neon memerlukan SSL connection
- Pastikan database.js sudah update dengan SSL config

### Query timeout di migrations
- Vercel serverless ada timeout limit
- Coba split migrations jadi lebih kecil atau jalankan lokal dulu

## Docs Referensi

- Neon: https://neon.tech/docs
- Sequelize + PostgreSQL: https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

## Checklist Final

- [ ] Neon account dibuat
- [ ] Database dibuat di Neon
- [ ] CONNECTION_STRING didapat
- [ ] Environment variables di Vercel sudah diset
- [ ] Code di-push ke GitHub
- [ ] Deploy berhasil (check Vercel dashboard)
- [ ] Migrations dijalankan
- [ ] Test query di Neon dashboard
- [ ] Application berjalan normal ✓
