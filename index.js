import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    makeCacheableSignalKeyStore,
    delay,
} from '@whiskeysockets/baileys';
import { parsePhoneNumber as PhoneNumber } from 'awesome-phonenumber';
import pino from 'pino';
import NodeCache from 'node-cache';

import config from './config.js';
import { printLog } from './lib/print.js';
import { loadPlugins } from './lib/pluginLoader.js';
import { getMode, isAntilinkEnabled, getPrefix, isWelcomeEnabled, isGoodbyeEnabled, isAnticallEnabled } from './lib/settings.js';
import { isSenderAdmin } from './lib/groupUtils.js';
import { isRateLimited, wrapSendMessage, getReconnectDelay, resetReconnectAttempts } from './lib/antiban.js';
import { app, server, PORT, setPairingHandler, setStatusProvider } from './lib/server.js';
import { startTelegramBridge } from './telegram-bridge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(__dirname, 'session');

let commandsMap = new Map();
let currentSock = null;
let isConnected = false;

fs.mkdirSync(SESSION_DIR, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

setStatusProvider(() => ({ connected: isConnected }));

// ── Accessors for the Telegram bridge ─────────────────────────────
// currentSock is replaced on every reconnect, so the bridge can't hold
// a reference directly — it calls these functions each time instead.
function getSock() {
    return currentSock;
}
function getCommandsMap() {
    return commandsMap;
}
function isConnectedFn() {
    return isConnected;
}
function requestPairing(number) {
    return requestPairingCode(currentSock, number);
}

function hasValidSession() {
    try {
        const credsPath = path.join(SESSION_DIR, 'creds.json');
        if (!fs.existsSync(credsPath)) return false;
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        return !!(creds.noiseKey && creds.signedIdentityKey && creds.registered);
    } catch {
        return false;
    }
}

async function requestPairingCode(sock, rawNumber) {
    const digits = String(rawNumber || '').replace(/[^0-9]/g, '');
    if (!digits) throw new Error('No phone number provided.');

    const pn = PhoneNumber(`+${digits}`);
    if (!pn.valid) throw new Error('Invalid phone number format.');

    if (sock?.authState?.creds?.registered) {
        throw new Error('A number is already linked. Delete the session folder and restart to pair a different number.');
    }

    let code = await sock.requestPairingCode(digits);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    printLog('success', `Pairing code for ${digits}: ${code}`);
    return code;
}

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const msgRetryCounterCache = new NodeCache();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        msgRetryCounterCache,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    });

    currentSock = sock;

    // Anti-ban: queue + humanize all outgoing messages
    wrapSendMessage(sock);

    // Wire the web pairing route to this live socket.
    setPairingHandler((number) => requestPairingCode(sock, number));

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isConnected = true;
            resetReconnectAttempts();
            printLog('success', `${config.botName} connected as ${sock.user?.id}`);
        }

        if (connection === 'close') {
            isConnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const loggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;

            if (loggedOut) {
                printLog('warning', 'Session logged out. Clearing session — pair again via /pair-request.');
                try {
                    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
                    fs.mkdirSync(SESSION_DIR, { recursive: true });
                } catch (_e) {}
                setTimeout(() => startBot().catch((e) => printLog('error', e.message)), 2000);
                return;
            }

            const delay = getReconnectDelay();
            printLog('warning', `Connection closed (code ${statusCode}). Reconnecting in ${Math.round(delay / 1000)}s...`);
            setTimeout(() => startBot().catch((e) => printLog('error', e.message)), delay);
        }
    });

    sock.ev.on('call', async (calls) => {
        if (!isAnticallEnabled()) return;
        for (const call of calls) {
            if (call.status !== 'offer') continue;
            try {
                await sock.rejectCall(call.id, call.from);
                await sock.sendMessage(call.from, {
                    text: '📵 Calls are not accepted by this bot. Please send a text message instead.',
                });
                printLog('info', `Anticall: rejected call from ${call.from}`);
            } catch (err) {
                printLog('error', `Anticall failed: ${err.message}`);
            }
        }
    });

    sock.ev.on('group-participants.update', async (event) => {
        try {
            const { id: groupId, participants, action } = event;
            if (action === 'add' && isWelcomeEnabled(groupId)) {
                const metadata = await sock.groupMetadata(groupId);
                for (const p of participants) {
                    await sock.sendMessage(groupId, {
                        text: `👋 Welcome @${p.split('@')[0]} to *${metadata.subject}*!`,
                        mentions: [p],
                    });
                }
            }
            if (action === 'remove' && isGoodbyeEnabled(groupId)) {
                for (const p of participants) {
                    await sock.sendMessage(groupId, {
                        text: `👋 @${p.split('@')[0]} has left the group.`,
                        mentions: [p],
                    });
                }
            }
        } catch (err) {
            printLog('error', `group-participants.update failed: ${err.message}`);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;
            const chatId = msg.key.remoteJid;
            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                '';

            if (chatId.endsWith('@g.us') && isAntilinkEnabled(chatId) && !msg.key.fromMe) {
                const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|t\.me)\S+/i;
                if (linkRegex.test(text)) {
                    const senderJid = msg.key.participant || msg.key.remoteJid;
                    const senderIsAdmin = await isSenderAdmin(sock, chatId, senderJid);
                    if (!senderIsAdmin) {
                        try {
                            await sock.sendMessage(chatId, { delete: msg.key });
                        } catch (_e) {}
                        continue;
                    }
                }
            }

            const activePrefix = getPrefix() || config.prefix;
            if (!text.startsWith(activePrefix)) continue;

            const [cmdName, ...args] = text.slice(activePrefix.length).trim().split(/\s+/);
            const plugin = commandsMap.get(cmdName.toLowerCase());
            if (!plugin) continue;

            if (getMode() === 'self' && !msg.key.fromMe) continue;

            const senderJid = msg.key.participant || msg.key.remoteJid;
            if (isRateLimited(senderJid, msg.key.fromMe)) continue;
            try {
                await sock.sendPresenceUpdate('composing', chatId);
                await plugin.handler(sock, msg, args, { chatId, config, commandsMap });
            } catch (err) {
                printLog('error', `Command "${cmdName}" failed: ${err.message}`);
                await sock
                    .sendMessage(chatId, { text: `❌ Something went wrong running that command.` }, { quoted: msg })
                    .catch(() => {});
            }
        }
    });

    return sock;
}

async function main() {
    commandsMap = await loadPlugins();

    server.listen(PORT, () => {
        printLog('success', `Web server listening on port ${PORT}`);
        if (hasValidSession()) {
            printLog('info', 'Existing session found — reconnecting automatically.');
        } else {
            printLog('info', `No session yet. Visit your app's URL + /pair-request to pair a number.`);
        }
    });

    await startBot();

    // Telegram bridge shares this process's live socket + plugins.
    // No-ops (logs a warning) if TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_IDS aren't set.
    startTelegramBridge({
        getSock,
        getCommandsMap,
        requestPairing,
        isConnected: isConnectedFn,
        config,
    });
}

main().catch((err) => {
    printLog('error', `Fatal error: ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err) => printLog('error', `Uncaught: ${err.message}`));
process.on('unhandledRejection', (err) => printLog('error', `Unhandled rejection: ${err?.message || err}`));
