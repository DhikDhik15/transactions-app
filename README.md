# SIMS PPOB REST API

REST API Node.js/Express yang mengikuti kontrak API SIMS PPOB dari Nutech untuk modul Membership, Information, dan Transaction.

## Fitur

- Registrasi dan login dengan JWT.
- Profile, update profile, dan upload profile image.
- Banner dan daftar layanan.
- Cek saldo user login.
- Top up saldo dengan pencatatan ledger.
- Transaksi pembayaran yang memotong saldo secara atomik menggunakan transaksi database.
- History transaksi gabungan TOPUP dan PAYMENT.
- Database MySQL dengan Sequelize dan migration `up/down`.
- Dokumentasi Swagger/OpenAPI di `/api-docs`.
- Gambar desain database di `docs/database-design.svg`.

## Setup

1. Pastikan MySQL berjalan. Jika user database punya izin `CREATE DATABASE`, aplikasi akan membuat database otomatis. Jika tidak, buat manual:

```sql
CREATE DATABASE payment_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Salin konfigurasi environment:

```bash
cp .env.example .env
```

3. Sesuaikan `DB_USER`, `DB_PASSWORD`, `DB_NAME`, dan `JWT_SECRET` di `.env`.

4. Jalankan migration tabel:

```bash
npm run migrate
```

5. Jalankan aplikasi:

```bash
npm start
```

Secara default aplikasi mencoba membuat database saat migration dijalankan. Tabel dibuat lewat file di `database/migrations`. `sequelize.sync()` dimatikan di `.env.example`; aktifkan `DB_SYNC=true` hanya untuk prototyping cepat tanpa migration.

Command migration:

```bash
npm run migrate
npm run migrate:undo
npm run migrate:undo:all
```

Layanan awal akan otomatis di-seed saat aplikasi start jika `SEED_SERVICES=true`.

## Endpoint

- `POST /registration` - registrasi user.
- `POST /login` - login dan mendapatkan JWT.
- `GET /profile` - profil user login.
- `PUT /profile/update` - update nama user.
- `PUT /profile/image` - upload profile image.
- `GET /banner` - daftar banner.
- `GET /services` - daftar layanan.
- `GET /balance` - cek saldo.
- `POST /topup` - top up saldo.
- `POST /transaction` - transaksi pembayaran.
- `GET /transaction/history` - riwayat transaksi.

Swagger UI tersedia di:

```text
http://localhost:3000/api-docs
```

OpenAPI JSON tersedia di:

```text
http://localhost:3000/swagger.json
```

## Contoh Flow

1. Registrasi user lewat `POST /registration`.
2. Gunakan `token` dari response sebagai `Authorization: Bearer <token>`.
3. Top up saldo lewat `POST /topup`.
4. Lihat layanan lewat `GET /services`.
5. Buat pembayaran lewat `POST /transaction`.

Contoh transaksi:

```json
{
  "service_code": "PULSA"
}
```

## Desain Database

Gambar ERD tersedia di:

```text
docs/database-design.svg
```
# transactions-app
