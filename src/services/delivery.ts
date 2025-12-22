import { Bot, InputFile } from 'grammy'
import { getContentFilesWithUrls } from './product'

/**
 * Deliver digital content to user after successful payment
 */
export async function deliverContent(
    bot: Bot,
    chatId: string | number,
    contentId: number
): Promise<boolean> {
    try {
        const content = await getContentFilesWithUrls(contentId)

        if (!content || content.files.length === 0) {
            await bot.api.sendMessage(
                chatId,
                '❌ Maaf, konten tidak ditemukan. Silakan hubungi admin.'
            )
            return false
        }

        // Send success message
        await bot.api.sendMessage(
            chatId,
            `✅ *Pembayaran Berhasil!*\n\n` +
            `Terima kasih telah membeli *${content.name}*.\n` +
            `Berikut adalah file yang kamu beli:`,
            { parse_mode: 'Markdown' }
        )

        // Send each file based on its type
        for (const file of content.files) {
            const caption = `📁 ${file.name}`

            switch (file.fileType) {
                case 'photo':
                    await bot.api.sendPhoto(chatId, file.signedUrl, { caption })
                    break
                case 'video':
                    await bot.api.sendVideo(chatId, file.signedUrl, { caption })
                    break
                case 'document':
                default:
                    await bot.api.sendDocument(chatId, file.signedUrl, { caption })
                    break
            }

            // Small delay between files to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500))
        }

        await bot.api.sendMessage(
            chatId,
            '🎉 Semua file telah dikirim!\n\nTerima kasih telah berbelanja. Ketik /start untuk melihat produk lainnya.'
        )

        return true
    } catch (error) {
        console.error('Error delivering content:', error)
        await bot.api.sendMessage(
            chatId,
            '❌ Terjadi kesalahan saat mengirim file. Silakan hubungi admin.'
        )
        return false
    }
}
