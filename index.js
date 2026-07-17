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
import { app, server, PORT, setPairingHandler, setStatusProvider } from './lib/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = path.join(__dirname, 'session');

let commandsMap = new Map();
let currentSock = null;
let isConnected = false;

fs.mkdirSync(SESSION_DIR, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

setStatusProvider(() => ({ connected: isConnected }));

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

    // Wire the web pairing route to this live socket.
    setPairingHandler((number) => requestPairingCode(sock, number));

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isConnected = true;
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

            printLog('warning', `Connection closed (code ${statusCode}). Reconnecting in 5s...`);
            setTimeout(() => startBot().catch((e) => printLog('error', e.message)), 5000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const chatId = msg.key.remoteJid;
            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                '';

            if (!text.startsWith(config.prefix)) continue;

            const [cmdName, ...args] = text.slice(config.prefix.length).trim().split(/\s+/);
            const plugin = commandsMap.get(cmdName.toLowerCase());
            if (!plugin) continue;

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
}

main().catch((err) => {
    printLog('error', `Fatal error: ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err) => printLog('error', `Uncaught: ${err.message}`));
process.on('unhandledRejection', (err) => printLog('error', `Unhandled rejection: ${err?.message || err}`));