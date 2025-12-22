import { Bot, Context } from 'grammy'

export function registerHelpCommand(bot: Bot) {
    bot.command('help', async (ctx: Context) => {
        await ctx.reply(
            '📖 *Panduan Penggunaan Bot*\n\n' +
            '*Cara Membeli:*\n' +
            '1️⃣ Ketik /start untuk melihat daftar produk\n' +
            '2️⃣ Klik produk yang ingin dibeli\n' +
            '3️⃣ Klik tombol "Beli Sekarang"\n' +
            '4️⃣ Scan QR Code untuk pembayaran\n' +
            '5️⃣ Setelah pembayaran berhasil, produk akan dikirim otomatis\n\n' +
            '*Perintah:*\n' +
            '/start - Lihat daftar produk\n' +
            '/help - Panduan penggunaan\n\n' +
            '_Butuh bantuan? Hubungi admin._',
            { parse_mode: 'Markdown' }
        )
    })
}
