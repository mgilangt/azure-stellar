import { Bot, Context, InlineKeyboard } from 'grammy'
import { prisma } from '../../lib/prisma'
import { getAllContents, formatPrice } from '../../services/product'

export function registerStartCommand(bot: Bot) {
    bot.command('start', async (ctx: Context) => {
        const telegramUser = ctx.from

        if (!telegramUser) {
            await ctx.reply('❌ Tidak dapat mengidentifikasi user.')
            return
        }

        // Upsert user in database
        await prisma.user.upsert({
            where: { idTele: telegramUser.id.toString() },
            update: { nama: telegramUser.first_name },
            create: {
                idTele: telegramUser.id.toString(),
                nama: telegramUser.first_name,
            },
        })

        // Get all products
        const contents = await getAllContents()

        if (contents.length === 0) {
            await ctx.reply(
                '👋 Selamat datang!\n\n' +
                'Maaf, saat ini belum ada produk tersedia.'
            )
            return
        }

        // Build inline keyboard with products
        const keyboard = new InlineKeyboard()

        for (const content of contents) {
            keyboard
                .text(
                    `${content.name} - ${formatPrice(content.price)}`,
                    `buy_${content.id}`
                )
                .row()
        }

        await ctx.reply(
            '👋 *Selamat datang di Toko Digital!*\n\n' +
            '📦 Pilih produk yang ingin kamu beli:\n\n' +
            '_Klik tombol di bawah untuk melihat detail dan membeli_',
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            }
        )
    })
}
