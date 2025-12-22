import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { createBot } from './bot'
import { createWebhookRoutes } from './routes/webhook'
import { createAdminRoutes } from './routes/admin'
import { prisma } from './lib/prisma'
import { getInvoice } from './services/xendit'
import { deliverContent } from './services/delivery'
import { readFileSync } from 'fs'
import { join } from 'path'

async function main() {
    // Initialize Hono app
    const app = new Hono()

    // Middleware
    app.use('*', logger())
    app.use('*', cors())

    // Initialize bot
    const bot = createBot()

    // Register webhook routes
    const webhookRoutes = createWebhookRoutes(bot)
    app.route('/webhook', webhookRoutes)

    // Register admin API routes
    const adminRoutes = createAdminRoutes()
    app.route('/api/admin', adminRoutes)

    // Admin panel pages
    app.get('/admin', (c) => c.redirect('/admin/login'))

    app.get('/admin/login', (c) => {
        const loginHtml = readFileSync(join(__dirname, 'view', 'admin', 'login.html'), 'utf-8')
        return c.html(loginHtml)
    })

    app.get('/admin/dashboard', (c) => {
        const dashboardHtml = readFileSync(join(__dirname, 'view', 'admin', 'dashboard.html'), 'utf-8')
        return c.html(dashboardHtml)
    })

    app.get('/admin/content', (c) => {
        const contentHtml = readFileSync(join(__dirname, 'view', 'admin', 'content.html'), 'utf-8')
        return c.html(contentHtml)
    })

    app.get('/admin/files', (c) => {
        const filesHtml = readFileSync(join(__dirname, 'view', 'admin', 'files.html'), 'utf-8')
        return c.html(filesHtml)
    })

    // Root route - serve landing page
    app.get('/', (c) => {
        const landingHtml = readFileSync(join(__dirname, 'view', 'landing.html'), 'utf-8')
        return c.html(landingHtml)
    })

    // Watch route - serve video player page
    app.get('/watch', (c) => {
        const watchHtml = readFileSync(join(__dirname, 'view', 'watch.html'), 'utf-8')
        return c.html(watchHtml)
    })

    // Serve assets (logo, images, etc.)
    app.get('/assets/:filename', (c) => {
        const filename = c.req.param('filename')
        const filepath = join(__dirname, 'view', 'assets', filename)
        try {
            const file = readFileSync(filepath)
            const ext = filename.split('.').pop()?.toLowerCase()
            const contentType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream'
            return new Response(file, { headers: { 'Content-Type': contentType } })
        } catch {
            return c.notFound()
        }
    })

    // Payment success redirect (after user pays via QRIS)
    app.get('/success', (c) => {
        return c.html(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pembayaran Berhasil</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
                    .card { background: white; padding: 40px; border-radius: 16px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    h1 { color: #22c55e; }
                    p { color: #666; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>✅ Pembayaran Berhasil!</h1>
                    <p>Terima kasih atas pembelian Anda.</p>
                    <p>Produk digital akan dikirim ke Telegram Anda dalam beberapa saat.</p>
                    <p><strong>Silakan kembali ke Telegram.</strong></p>
                </div>
            </body>
            </html>
        `)
    })

    // Payment failed redirect
    app.get('/failed', (c) => {
        return c.html(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pembayaran Gagal</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
                    .card { background: white; padding: 40px; border-radius: 16px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    h1 { color: #ef4444; }
                    p { color: #666; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>❌ Pembayaran Gagal</h1>
                    <p>Pembayaran tidak dapat diproses atau telah expired.</p>
                    <p>Silakan kembali ke Telegram dan coba lagi.</p>
                </div>
            </body>
            </html>
        `)
    })

    // Payment callback - handles redirect from Xendit with query params
    app.get('/payment/callback', async (c) => {
        const transactionId = c.req.query('transaction_id')
        const status = c.req.query('status')

        console.log(`Payment callback: transaction_id=${transactionId}, status=${status}`)

        if (!transactionId) {
            return c.html(`<html><body style="font-family:sans-serif;text-align:center;padding:50px">
                <h1>❌ Error</h1><p>Transaction ID tidak ditemukan.</p></body></html>`)
        }

        try {
            const transaction = await prisma.transaction.findUnique({
                where: { id: parseInt(transactionId) },
                include: { user: true, content: true },
            })

            if (!transaction) {
                return c.html(`<html><body style="font-family:sans-serif;text-align:center;padding:50px">
                    <h1>❌ Transaksi Tidak Ditemukan</h1></body></html>`)
            }

            // If already processed
            if (transaction.status === 'PAID') {
                return c.html(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0f0f0">
                    <div style="background:white;padding:40px;border-radius:16px;max-width:400px;margin:0 auto">
                    <h1 style="color:#22c55e">✅ Pembayaran Berhasil!</h1>
                    <p>Produk sudah dikirim ke Telegram.</p></div></body></html>`)
            }

            // Verify with Xendit API
            if (transaction.xenditInvoiceId && status === 'success') {
                const invoice = await getInvoice(transaction.xenditInvoiceId)

                if (invoice.status === 'PAID') {
                    await prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'PAID', paidAt: new Date() },
                    })

                    console.log(`Payment confirmed for transaction ${transaction.id}`)

                    // Deliver content
                    await deliverContent(bot, transaction.user.idTele, transaction.contentId)

                    return c.html(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0f0f0">
                        <div style="background:white;padding:40px;border-radius:16px;max-width:400px;margin:0 auto">
                        <h1 style="color:#22c55e">✅ Pembayaran Berhasil!</h1>
                        <p>Produk digital telah dikirim ke Telegram Anda.</p>
                        <p><strong>Silakan kembali ke Telegram.</strong></p></div></body></html>`)
                }
            }

            // Payment pending
            return c.html(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0f0f0">
                <div style="background:white;padding:40px;border-radius:16px;max-width:400px;margin:0 auto">
                <h1 style="color:#f59e0b">⏳ Pembayaran Pending</h1>
                <p>Status belum terkonfirmasi. Tunggu beberapa saat.</p></div></body></html>`)
        } catch (error) {
            console.error('Payment callback error:', error)
            return c.html(`<html><body style="font-family:sans-serif;text-align:center;padding:50px">
                <h1>❌ Terjadi Kesalahan</h1><p>Hubungi admin.</p></body></html>`)
        }
    })

    // Start bot (long polling)
    bot.start({
        onStart: (botInfo) => {
            console.log(`🤖 Bot @${botInfo.username} is running!`)
        },
    })

    // Start HTTP server
    const port = parseInt(process.env.PORT || '3000')

    console.log(`🚀 Server starting on port ${port}...`)

    serve({
        fetch: app.fetch,
        port,
    })

    console.log(`✅ Server is running at http://localhost:${port}`)
    console.log(`📡 Webhook endpoint: http://localhost:${port}/webhook/xendit`)
}

main().catch(console.error)
