import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { createBot } from './bot/index.js'
import { createWebhookRoutes } from './routes/webhook.js'

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
