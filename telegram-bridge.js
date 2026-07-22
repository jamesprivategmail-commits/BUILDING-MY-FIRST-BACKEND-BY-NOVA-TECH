import TelegramBot from 'node-telegram-bot-api';
import { printLog } from './lib/print.js';

/**
 * Starts the Telegram control bridge.
 *
 * This bot doesn't hold its own WhatsApp connection — it borrows the live
 * one from index.js through the accessor functions passed in, since the
 * Baileys socket object is replaced on every reconnect.
 *
 * @param {Object} deps
 * @param {() => import('@whiskeysockets/baileys').WASocket|null} deps.getSock
 * @param {() => Map} deps.getCommandsMap
 * @param {(number: string) => Promise<string>} deps.requestPairing
 * @param {() => boolean} deps.isConnected
 * @param {Object} deps.config
 */
export function startTelegramBridge({ getSock, getCommandsMap, requestPairing, isConnected, config }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        printLog('warning', 'TELEGRAM_BOT_TOKEN not set — Telegram bridge disabled.');
        return null;
    }

    const adminIds = String(process.env.TELEGRAM_ADMIN_IDS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (!adminIds.length) {
        printLog('warning', 'TELEGRAM_ADMIN_IDS not set — Telegram bridge disabled (no one authorized).');
        return null;
    }

    const bot = new TelegramBot(token, { polling: true });

    function isAdmin(msg) {
        return adminIds.includes(String(msg.from.id));
    }

    function denyIfNotAdmin(msg) {
        if (!isAdmin(msg)) {
            bot.sendMessage(msg.chat.id, '⛔ You are not authorized to use this bridge.');
            return true;
        }
        return false;
    }

    bot.getMe().then((me) => printLog('success', `Telegram bridge connected as @${me.username}`));

    // ── /pair <number> ─────────────────────────────────────────────
    bot.onText(/\/pair(?:\s+(\S+))?/, async (msg, match) => {
        if (denyIfNotAdmin(msg)) return;
        const number = match[1];
        if (!number) {
            return bot.sendMessage(msg.chat.id, 'Usage: /pair <phone_number_with_country_code>\nExample: /pair 15551234567');
        }
        try {
            const code = await requestPairing(number);
            const text =
                `❐✦ <b>ᴡʜᴀᴛsᴀᴘᴘ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ</b> ✦❐\n` +
                `┃» <b>ɴᴜᴍʙᴇʀ</b> : ${number}\n` +
                `┗❐ <b>ᴄᴏᴅᴇ</b> : <code>${code}</code>\n\n` +
                `Open WhatsApp → Linked Devices → Link with phone number, and enter this code.`;
            bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(msg.chat.id, `❌ Pairing failed: ${err.message}`);
        }
    });

    // ── /status ─────────────────────────────────────────────────────
    bot.onText(/\/status/, (msg) => {
        if (denyIfNotAdmin(msg)) return;
        const sock = getSock();
        const connected = isConnected();
        const text =
            `❐✦ <b>ɴᴏᴠᴀ ᴛᴇᴄʜ sᴛᴀᴛᴜs</b> ✦❐\n` +
            `┃» <b>ᴡʜᴀᴛsᴀᴘᴘ</b> : ${connected ? '🟢 Connected' : '🔴 Disconnected'}\n` +
            `┃» <b>ʟɪɴᴋᴇᴅ ᴀs</b> : ${sock?.user?.id || 'n/a'}\n` +
            `┗❐ <b>ᴜᴘᴛɪᴍᴇ</b> : ${Math.floor(process.uptime())}s`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
    });

    // ── /run <command> <chatId> [args...] ─────────────────────────────
    // Runs an existing Nova Tech V2 plugin command against a WhatsApp chat,
    // exactly as if it had been triggered from inside WhatsApp.
    bot.onText(/\/run(?:\s+(\S+))?(?:\s+(\S+))?(?:\s+(.*))?/, async (msg, match) => {
        if (denyIfNotAdmin(msg)) return;

        const [, cmdName, chatId, rest] = match;
        if (!cmdName || !chatId) {
            return bot.sendMessage(
                msg.chat.id,
                'Usage: /run <command> <chatId> [args...]\nExample: /run ping 15551234567@s.whatsapp.net'
            );
        }

        const sock = getSock();
        if (!sock || !isConnected()) {
            return bot.sendMessage(msg.chat.id, '⛔ WhatsApp is not connected right now.');
        }

        const commandsMap = getCommandsMap();
        const plugin = commandsMap.get(cmdName.toLowerCase());
        if (!plugin) {
            return bot.sendMessage(msg.chat.id, `❌ No plugin found for "${cmdName}".`);
        }

        const args = rest ? rest.trim().split(/\s+/) : [];

        // Minimal fake WhatsApp message so existing plugin handlers work unmodified.
        const fakeMsg = {
            key: {
                remoteJid: chatId,
                fromMe: true,
                id: `TG-BRIDGE-${Date.now()}`,
                participant: undefined,
            },
            pushName: msg.from.first_name || msg.from.username || 'Admin',
            message: { conversation: `${config.prefix}${cmdName} ${args.join(' ')}`.trim() },
        };

        try {
            await plugin.handler(sock, fakeMsg, args, { chatId, config, commandsMap });
            bot.sendMessage(msg.chat.id, `✅ Ran /${cmdName} on ${chatId}`);
        } catch (err) {
            printLog('error', `Telegram bridge /run "${cmdName}" failed: ${err.message}`);
            bot.sendMessage(msg.chat.id, `❌ Command failed: ${err.message}`);
        }
    });

    bot.onText(/\/menu|\/help/, (msg) => {
        if (denyIfNotAdmin(msg)) return;
        const text =
            `❐✦ <b>ɴᴏᴠᴀ ᴛᴇᴄʜ ʙʀɪᴅɢᴇ</b> ✦❐\n` +
            `┃» /pair <number> — get WhatsApp pairing code\n` +
            `┃» /status — check WhatsApp connection\n` +
            `┃» /run <command> <chatId> [args] — run a plugin remotely\n` +
            `┗❐`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
    });

    bot.on('polling_error', (err) => printLog('error', `Telegram polling error: ${err.message}`));

    return bot;
}
