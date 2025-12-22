# Telegram Digital Shop Bot

Bot Telegram untuk jual beli produk digital dengan pembayaran QRIS via Xendit.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono
- **Bot**: Grammy
- **ORM**: Prisma
- **Database**: MySQL
- **Payment**: Xendit
- **Storage**: DigitalOcean Spaces

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` ke `.env` dan isi dengan credentials kamu:

```bash
cp .env.example .env
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# (Optional) Seed sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Lihat daftar produk |
| `/help` | Panduan penggunaan |

## Webhook Setup

Untuk menerima notifikasi pembayaran dari Xendit:

1. Deploy bot ke server dengan HTTPS
2. Di Xendit Dashboard, set callback URL ke:
   ```
   https://your-domain.com/webhook/xendit
   ```
3. Set callback token di Xendit dan tambahkan ke `.env` sebagai `XENDIT_WEBHOOK_TOKEN`

## Flow Pembayaran

```
1. User /start → Lihat produk
2. User pilih produk → Detail + tombol beli
3. User klik "Beli" → Bot buat invoice Xendit
4. User bayar via QRIS
5. Xendit kirim webhook → Bot update status
6. Bot kirim file ke user
```

## Project Structure

```
├── src/
│   ├── index.ts              # Entry point
│   ├── bot/
│   │   ├── index.ts          # Bot setup
│   │   ├── commands/         # Bot commands
│   │   └── handlers/         # Callback handlers
│   ├── routes/
│   │   └── webhook.ts        # Xendit webhook
│   ├── services/
│   │   ├── xendit.ts         # Xendit API
│   │   ├── product.ts        # Product logic
│   │   └── delivery.ts       # File delivery
│   └── lib/
│       ├── prisma.ts         # Database client
│       └── spaces.ts         # DO Spaces client
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── package.json
```
