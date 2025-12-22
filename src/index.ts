import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { createBot } from './bot'
import { createWebhookRoutes } from './routes/webhook'

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

    // Root route
    app.get('/', (c) => {
        return c.json({
            name: 'Telegram Shop Bot',
            version: '1.0.0',
            status: 'running',
        })
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
