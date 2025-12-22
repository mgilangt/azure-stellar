import { Bot, Context, InlineKeyboard } from 'grammy'
import { prisma } from '../lib/prisma.js'
import { getContentById, formatPrice } from '../services/product.js'
import { createInvoice } from '../services/xendit.js'

export function registerCallbackHandlers(bot: Bot) {
    // Handle product selection (buy_<id>)
    bot.callbackQuery(/^buy_(\d+)$/, async (ctx: Context) => {
        const match = ctx.callbackQuery?.data?.match(/^buy_(\d+)$/)
        if (!match) return

        const contentId = parseInt(match[1])
        const content = await getContentById(contentId)

        if (!content) {
            await ctx.answerCallbackQuery({ text: '❌ Produk tidak ditemukan' })
            return
        }

        // Show product details with buy button
        const keyboard = new InlineKeyboard()
            .text('💳 Beli Sekarang', `confirm_${contentId}`)
            .row()
            .text('« Kembali', 'back_to_list')

        const description = content.description || 'Tidak ada deskripsi'
        const fileCount = content.files?.length || 0

        await ctx.editMessageText(
            `📦 *${content.name}*\n\n` +
            `${description}\n\n` +
            `📁 Jumlah file: ${fileCount}\n` +
            `💰 Harga: *${formatPrice(content.price)}*\n\n` +
            `_Klik tombol di bawah untuk membeli_`,
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            }
        )

        await ctx.answerCallbackQuery()
    })

    // Handle back to product list
    bot.callbackQuery('back_to_list', async (ctx: Context) => {
        const contents = await prisma.content.findMany({
            orderBy: { createdAt: 'desc' },
        })

        const keyboard = new InlineKeyboard()

        for (const content of contents) {
            keyboard
                .text(
                    `${content.name} - ${formatPrice(content.price)}`,
                    `buy_${content.id}`
                )
                .row()
        }

        await ctx.editMessageText(
            '👋 *Selamat datang di Toko Digital!*\n\n' +
            '📦 Pilih produk yang ingin kamu beli:\n\n' +
            '_Klik tombol di bawah untuk melihat detail dan membeli_',
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard,
            }
        )

        await ctx.answerCallbackQuery()
    })

    // Handle purchase confirmation (confirm_<id>)
    bot.callbackQuery(/^confirm_(\d+)$/, async (ctx: Context) => {
        const match = ctx.callbackQuery?.data?.match(/^confirm_(\d+)$/)
        if (!match || !ctx.from) return

        const contentId = parseInt(match[1])
        const content = await getContentById(contentId)

        if (!content) {
            await ctx.answerCallbackQuery({ text: '❌ Produk tidak ditemukan' })
            return
        }

        await ctx.answerCallbackQuery({ text: '⏳ Membuat invoice...' })

        try {
            // Get or create user
            const user = await prisma.user.upsert({
                where: { idTele: ctx.from.id.toString() },
                update: {},
                create: {
                    idTele: ctx.from.id.toString(),
                    nama: ctx.from.first_name,
                },
            })

            // Create transaction
            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    contentId: content.id,
                    amount: content.price,
                    status: 'PENDING',
                    expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            })

            // Create Xendit invoice
            const invoice = await createInvoice({
                externalId: `TRX-${transaction.id}-${Date.now()}`,
                amount: content.price,
                description: `Pembelian: ${content.name}`,
                customerName: ctx.from.first_name,
            })

            // Update transaction with invoice details
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    xenditInvoiceId: invoice.id,
                    paymentUrl: invoice.invoice_url,
                },
            })

            // Send payment link to user
            const keyboard = new InlineKeyboard()
                .url('💳 Bayar Sekarang', invoice.invoice_url)
                .row()
                .text('❌ Batalkan', `cancel_${transaction.id}`)

            await ctx.editMessageText(
                `🧾 *Invoice Pembayaran*\n\n` +
                `Produk: *${content.name}*\n` +
                `Total: *${formatPrice(content.price)}*\n\n` +
                `Klik tombol di bawah untuk melakukan pembayaran.\n` +
                `Invoice berlaku selama 24 jam.\n\n` +
                `_Setelah pembayaran berhasil, produk akan dikirim otomatis._`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard,
                }
            )
        } catch (error) {
            console.error('Error creating invoice:', error)
            await ctx.editMessageText(
                '❌ Terjadi kesalahan saat membuat invoice.\n' +
                'Silakan coba lagi atau hubungi admin.'
            )
        }
    })

    // Handle cancel transaction
    bot.callbackQuery(/^cancel_(\d+)$/, async (ctx: Context) => {
        const match = ctx.callbackQuery?.data?.match(/^cancel_(\d+)$/)
        if (!match) return

        const transactionId = parseInt(match[1])

        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'CANCELLED' },
        })

        await ctx.editMessageText(
            '❌ Transaksi dibatalkan.\n\n' +
            'Ketik /start untuk melihat produk lainnya.'
        )

        await ctx.answerCallbackQuery({ text: 'Transaksi dibatalkan' })
    })
}
