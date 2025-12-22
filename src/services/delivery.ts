import { Bot } from 'grammy'
import { prisma } from '../lib/prisma'
import { getContentFilesWithUrls } from './product'

/**
 * Deliver content to user after successful payment
 * Handles both FILE (digital files) and GROUP (invite to group/channel) types
 */
export async function deliverContent(
    bot: Bot,
    chatId: string | number,
    contentId: number
): Promise<boolean> {
    try {
        // Get content with type info
        const content = await prisma.content.findUnique({
            where: { id: contentId },
            include: { files: true },
        })

        if (!content) {
            await bot.api.sendMessage(
                chatId,
                '❌ Maaf, konten tidak ditemukan. Silakan hubungi admin.'
            )
            return false
        }

        // Handle based on content type
        if (content.type === 'GROUP') {
            return await deliverGroupAccess(bot, chatId, content)
        } else {
            return await deliverFiles(bot, chatId, content)
        }
    } catch (error) {
        console.error('Error delivering content:', error)
        await bot.api.sendMessage(
            chatId,
            '❌ Terjadi kesalahan saat mengirim konten. Silakan hubungi admin.'
        )
        return false
    }
}

/**
 * Deliver FILE type content - send digital files
 */
async function deliverFiles(
    bot: Bot,
    chatId: string | number,
    content: { id: number; name: string; files: { name: string; mediaUrl: string; fileType: string }[] }
): Promise<boolean> {
    try {
        const contentWithUrls = await getContentFilesWithUrls(content.id)

        if (!contentWithUrls || contentWithUrls.files.length === 0) {
            await bot.api.sendMessage(
                chatId,
                '❌ Maaf, file tidak tersedia. Silakan hubungi admin.'
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
        for (const file of contentWithUrls.files) {
            const caption = `📁 ${file.name}`

            switch (file.fileType) {
                case 'photo':
                    await bot.api.sendPhoto(chatId, file.signedUrl, { caption })
                    break
                case 'video':
                    await bot.api.sendVideo(chatId, file.signedUrl, { caption })
                    break
                case 'audio':
                    await bot.api.sendAudio(chatId, file.signedUrl, { caption })
                    break
                case 'document':
                default:
                    await bot.api.sendDocument(chatId, file.signedUrl, { caption })
                    break
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500))
        }

        await bot.api.sendMessage(
            chatId,
            '🎉 Semua file telah dikirim!\n\nTerima kasih telah berbelanja. Ketik /start untuk melihat produk lainnya.'
        )

        return true
    } catch (error) {
        console.error('Error delivering files:', error)
        throw error
    }
}

/**
 * Deliver GROUP type content - send invite link to group/channel
 */
async function deliverGroupAccess(
    bot: Bot,
    chatId: string | number,
    content: { id: number; name: string; groupChatId: string | null; inviteLink: string | null }
): Promise<boolean> {
    try {
        let inviteLink = content.inviteLink

        // If no static invite link, try to generate one
        if (!inviteLink && content.groupChatId) {
            try {
                // Try to create invite link (bot must be admin with invite_users permission)
                const invite = await bot.api.createChatInviteLink(content.groupChatId, {
                    name: `Purchase - ${Date.now()}`,
                    member_limit: 1, // Single use
                })
                inviteLink = invite.invite_link
            } catch (error) {
                console.error('Failed to generate invite link:', error)
            }
        }

        if (!inviteLink) {
            await bot.api.sendMessage(
                chatId,
                '❌ Maaf, link invite tidak tersedia. Silakan hubungi admin.'
            )
            return false
        }

        // Send success message with invite button
        await bot.api.sendMessage(
            chatId,
            `✅ *Pembayaran Berhasil!*\n\n` +
            `Terima kasih telah membeli akses *${content.name}*.\n\n` +
            `Klik tombol di bawah untuk bergabung ke grup eksklusif! 🎉`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '👥 Join Group', url: inviteLink }
                    ]]
                }
            }
        )

        return true
    } catch (error) {
        console.error('Error delivering group access:', error)
        throw error
    }
}
