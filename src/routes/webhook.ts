import { Hono } from 'hono'
import { Bot } from 'grammy'
import { prisma } from '../lib/prisma.js'
import { verifyWebhookToken } from '../services/xendit.js'
import { deliverContent } from '../services/delivery.js'

interface XenditWebhookPayload {
    id: string
    external_id: string
    user_id: string
    is_high: boolean
    status: 'PAID' | 'EXPIRED' | 'PENDING'
    merchant_name: string
    amount: number
    paid_amount?: number
    bank_code?: string
    paid_at?: string
    payer_email?: string
    description?: string
    adjusted_received_amount?: number
    fees_paid_amount?: number
    created: string
    updated: string
    currency: string
    payment_method?: string
    payment_channel?: string
    payment_destination?: string
}

export function createWebhookRoutes(bot: Bot) {
    const webhook = new Hono()

    // Xendit payment webhook
    webhook.post('/xendit', async (c) => {
        try {
            // Verify webhook token
            const webhookToken = c.req.header('x-callback-token')

            if (!webhookToken || !verifyWebhookToken(webhookToken)) {
                console.error('Invalid webhook token')
                return c.json({ error: 'Invalid token' }, 401)
            }

            const payload: XenditWebhookPayload = await c.req.json()

            console.log('Received Xendit webhook:', {
                id: payload.id,
                external_id: payload.external_id,
                status: payload.status,
            })

            // Find transaction by Xendit invoice ID
            const transaction = await prisma.transaction.findUnique({
                where: { xenditInvoiceId: payload.id },
                include: { user: true, content: true },
            })

            if (!transaction) {
                console.error('Transaction not found for invoice:', payload.id)
                return c.json({ error: 'Transaction not found' }, 404)
            }

            // Handle payment status
            if (payload.status === 'PAID') {
                // Update transaction status
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'PAID',
                        paidAt: payload.paid_at ? new Date(payload.paid_at) : new Date(),
                    },
                })

                console.log(`Payment successful for transaction ${transaction.id}`)

                // Deliver content to user
                await deliverContent(
                    bot,
                    transaction.user.idTele,
                    transaction.contentId
                )

                return c.json({ success: true, message: 'Payment processed and content delivered' })
            }

            if (payload.status === 'EXPIRED') {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'EXPIRED' },
                })

                // Notify user
                await bot.api.sendMessage(
                    transaction.user.idTele,
                    '⏰ Invoice pembayaran kamu sudah expired.\n\n' +
                    'Ketik /start untuk membuat pesanan baru.'
                )

                return c.json({ success: true, message: 'Transaction marked as expired' })
            }

            return c.json({ success: true, message: 'Webhook received' })
        } catch (error) {
            console.error('Webhook error:', error)
            return c.json({ error: 'Internal server error' }, 500)
        }
    })

    // Health check
    webhook.get('/health', (c) => {
        return c.json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    return webhook
}
