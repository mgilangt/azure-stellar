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
                'Maaf, saat ini belum ada film nya bray wkwkwkwk.'
            )
            return
        }

        // Build inline keyboard with products
        const keyboard = new InlineKeyboard()

        for (const content of contents) {
            // Type badge: 📁 for FILE, 👥 for GROUP
            const typeBadge = content.type === 'GROUP' ? '👥' : '📁'
            keyboard
                .text(
                    `${typeBadge} ${content.name} - ${formatPrice(content.price)}`,
                    `buy_${content.id}`
                )
                .row()
        }

        await ctx.reply(
            '👋 *Selamat datang di Miniseri "Bukan Drama Korea, Ini Drama Tetangga!"*\n\n' +
            '📦 Pilih Drama Tetangga yang ingin kamu beli eh nonton:\n\n' +
            '_Klik tombol di bawah untuk melihat detail dan nonton_',
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            }
        )
    })
}
