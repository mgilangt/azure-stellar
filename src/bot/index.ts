import { Bot } from 'grammy'
import { registerStartCommand } from './commands/start'
import { registerHelpCommand } from './commands/help'
import { registerCallbackHandlers } from './handlers/callback'

export function createBot(): Bot {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is required')
    }

    const bot = new Bot(token)

    // Register commands
    registerStartCommand(bot)
    registerHelpCommand(bot)

    // Register callback handlers
    registerCallbackHandlers(bot)

    // Error handler
    bot.catch((err) => {
        console.error('Bot error:', err)
    })

    return bot
}
