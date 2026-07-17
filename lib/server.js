import express from 'express';
import { createServer } from 'http';
import config from '../config.js';

const app = express();
const server = createServer(app);
const PORT = config.port;

// Set by index.js once the Baileys socket is ready. Lets /pair-request
// request a pairing code for ANY number on demand.
let pairingHandler = null;
export function setPairingHandler(fn) {
    pairingHandler = fn;
}

// Set by index.js — used to show live connection status on the pairing page.
let statusProvider = () => ({ connected: false });
export function setStatusProvider(fn) {
    statusProvider = fn;
}

const page = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root { --primary: #22c55e; --bg: #0a0f1a; --card: rgba(255,255,255,0.04); }
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh; background: var(--bg); color: #f1f5f9;
            font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
            display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .card {
            background: var(--card); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px; padding: 32px 28px; width: 100%; max-width: 400px;
            text-align: center; backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 4px; font-size: 1.6rem; letter-spacing: 2px; color: var(--primary); }
        .sub { color: #94a3b8; font-size: 0.85rem; margin-bottom: 24px; }
        input {
            width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #334155;
            background: #0f172a; color: #fff; font-size: 1rem; margin-bottom: 14px;
        }
        input:focus { outline: none; border-color: var(--primary); }
        button {
            width: 100%; padding: 14px; border-radius: 12px; border: none;
            background: var(--primary); color: #052e16; font-weight: 700; font-size: 1rem;
            cursor: pointer;
        }
        .code {
            font-size: 2.2rem; font-weight: 800; letter-spacing: 6px;
            color: var(--primary); margin: 20px 0; word-break: break-all;
        }
        .hint { color: #94a3b8; font-size: 0.8rem; line-height: 1.5; }
        .status { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem;
            color: #64748b; margin-top: 18px; text-transform: uppercase; letter-spacing: 1px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: #64748b; }
        .dot.on { background: var(--primary); box-shadow: 0 0 8px var(--primary); }
        .err { color: #f87171; font-size: 0.85rem; margin-top: 8px; }
        a { color: var(--primary); }
    </style>
</head>
<body><div class="card">${body}</div></body>
</html>`;

app.get('/', (req, res) => {
    const uptime = Math.floor(process.uptime());
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = uptime % 60;
    const status = statusProvider();

    res.send(page(config.botName, `
        <h1>${config.botName.toUpperCase()}</h1>
        <p class="sub">WhatsApp Multi-Device Bot</p>
        <div class="status">
            <span class="dot ${status.connected ? 'on' : ''}"></span>
            ${status.connected ? 'Connected' : 'Not paired'}
        </div>
        <p class="hint" style="margin-top:18px">Uptime: ${h}h ${m}m ${s}s</p>
        ${!status.connected ? `<p class="hint"><a href="/pair-request">Pair a number →</a></p>` : ''}
    `));
});

app.get('/health', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        status: 'ok',
        bot: config.botName,
        uptime: Math.floor(process.uptime()),
        memoryMB: Math.round(mem.rss / 1024 / 1024),
        ...statusProvider(),
    });
});

app.get('/pair-request', async (req, res) => {
    const { number } = req.query;

    if (!number) {
        return res.send(page(`${config.botName} · Pairing`, `
            <h1>${config.botName.toUpperCase()}</h1>
            <p class="sub">Enter a WhatsApp number to pair</p>
            <form>
                <input name="number" placeholder="e.g. 2348012345678" pattern="[0-9]+" required>
                <button type="submit">Get Pairing Code</button>
            </form>
            <p class="hint">Country code + number, no + or spaces</p>
        `));
    }

    if (!pairingHandler) {
        return res.status(503).send(page(config.botName, `
            <h1>${config.botName.toUpperCase()}</h1>
            <p class="err">Bot is still starting up. Wait a few seconds and refresh.</p>
        `));
    }

    try {
        const code = await pairingHandler(number);
        res.send(page(`${config.botName} · Code`, `
            <h1>${config.botName.toUpperCase()}</h1>
            <p class="sub">Your pairing code</p>
            <div class="code">${code}</div>
            <p class="hint">
                On your phone: <b>WhatsApp → Linked Devices → Link a Device →
                Link with phone number instead</b><br>
                Enter this code within 60 seconds.
            </p>
        `));
    } catch (err) {
        res.status(400).send(page(config.botName, `
            <h1>${config.botName.toUpperCase()}</h1>
            <p class="err">${err.message}</p>
            <p class="hint"><a href="/pair-request">Try again →</a></p>
        `));
    }
});

export { app, server, PORT };