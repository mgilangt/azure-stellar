import { Bot, Context } from 'grammy'
import { prisma } from '../../lib/prisma'

/**
 * Handle join requests for GROUP type products
 * Auto-approves if user has a PAID transaction for the group
 */
export function registerJoinRequestHandler(bot: Bot) {
    bot.on('chat_join_request', async (ctx: Context) => {
        const joinRequest = ctx.chatJoinRequest
        if (!joinRequest) return

        const userId = joinRequest.from.id
        const chatId = joinRequest.chat.id
        const userName = joinRequest.from.first_name

        console.log(`Join request from ${userName} (${userId}) for chat ${chatId}`)

        try {
            // Debug: Check what contents exist with this groupChatId
            const matchingContent = await prisma.content.findFirst({
                where: { groupChatId: String(chatId) }
            })
            console.log(`🔍 Content with groupChatId ${chatId}:`, matchingContent?.name || 'NOT FOUND')

            // Debug: Check if user exists
            const user = await prisma.user.findFirst({
                where: { idTele: String(userId) }
            })
            console.log(`🔍 User ${userId}:`, user?.nama || 'NOT FOUND')

            // Debug: Check all PAID transactions for this user
            const userTransactions = await prisma.transaction.findMany({
                where: {
                    user: { idTele: String(userId) },
                    status: 'PAID'
                },
                include: { content: true }
            })
            console.log(`🔍 User's PAID transactions:`, userTransactions.map(t => ({
                contentName: t.content.name,
                groupChatId: t.content.groupChatId
            })))

            // Find if user has paid for this specific group
            const paidTransaction = await prisma.transaction.findFirst({
                where: {
                    user: { idTele: String(userId) },
                    content: { groupChatId: String(chatId) },
                    status: 'PAID',
                },
                include: {
                    content: true,
                    user: true,
                },
            })

            if (paidTransaction) {
                // User has paid - approve join request
                await ctx.approveChatJoinRequest(userId)

                console.log(`✅ Approved join request for ${userName} - paid transaction found`)

                // Notify user in private chat
                try {
                    await bot.api.sendMessage(
                        userId,
                        `✅ *Selamat bergabung!*\n\n` +
                        `Request kamu untuk join *${paidTransaction.content.name}* telah disetujui.\n\n` +
                        `Selamat menikmati konten eksklusif! 🎉`,
                        { parse_mode: 'Markdown' }
                    )
                } catch (e) {
                    // User might have blocked the bot
                    console.log('Could not send approval notification to user')
                }
            } else {
                // No payment found - decline join request
                await ctx.declineChatJoinRequest(userId)

                console.log(`❌ Declined join request for ${userName} - no payment found`)

                // Notify user they need to purchase first
                try {
                    await bot.api.sendMessage(
                        userId,
                        `❌ *Maaf, request kamu ditolak*\n\n` +
                        `Kamu belum membeli akses ke grup ini.\n\n` +
                        `Ketik /start untuk melihat produk yang tersedia.`,
                        { parse_mode: 'Markdown' }
                    )
                } catch (e) {
                    console.log('Could not send decline notification to user')
                }
            }
        } catch (error) {
            console.error('Error handling join request:', error)
        }
    })

    console.log('📝 Join request handler registered')
}
