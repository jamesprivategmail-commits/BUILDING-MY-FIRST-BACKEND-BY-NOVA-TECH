import express from 'express';
import { createServer } from 'http';
import config from '../config.js';

const app = express();
const server = createServer(app);
const PORT = config.port;

const LOGO_URL = 'https://i.postimg.cc/rFNpnfLp/ec3d253c8d0e4cd9684279e98b02b343.jpg';

let pairingHandler = null;
export function setPairingHandler(fn) {
    pairingHandler = fn;
}

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
        :root {
            --primary: #22c55e;
            --primary-glow: #22c55e66;
            --bg: #05070d;
            --card: rgba(255,255,255,0.045);
            --border: rgba(34,197,94,0.18);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh;
            background:
                radial-gradient(circle at 20% 10%, rgba(34,197,94,0.10), transparent 40%),
                radial-gradient(circle at 80% 90%, rgba(34,197,94,0.08), transparent 40%),
                var(--bg);
            color: #f1f5f9;
            font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
            display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 36px 30px;
            width: 100%; max-width: 420px;
            text-align: center;
            backdrop-filter: blur(14px);
            box-shadow: 0 0 60px -20px var(--primary-glow), 0 20px 40px -20px rgba(0,0,0,0.6);
        }
        .logo {
            width: 84px; height: 84px;
            border-radius: 20px;
            object-fit: cover;
            margin: 0 auto 18px;
            box-shadow: 0 0 0 3px rgba(34,197,94,0.25), 0 8px 24px -8px var(--primary-glow);
        }
        h1 {
            margin: 0 0 4px;
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: 3px;
            background: linear-gradient(135deg, #fff, var(--primary));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .sub { color: #94a3b8; font-size: 0.85rem; margin-bottom: 26px; }
        input {
            width: 100%; padding: 15px; border-radius: 14px;
            border: 1px solid #263041; background: #0b0f18; color: #fff;
            font-size: 1rem; margin-bottom: 14px; transition: border-color 0.2s;
        }
        input:focus { outline: none; border-color: var(--primary); }
        button {
            width: 100%; padding: 15px; border-radius: 14px; border: none;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: #04170a; font-weight: 800; font-size: 1rem;
            cursor: pointer; letter-spacing: 0.5px;
            transition: transform 0.15s, box-shadow 0.15s;
            box-shadow: 0 8px 20px -8px var(--primary-glow);
        }
        button:active { transform: scale(0.98); }
        .code {
            font-size: 2.4rem; font-weight: 800; letter-spacing: 7px;
            background: linear-gradient(135deg, #fff, var(--primary));
            -webkit-background-clip: text; background-clip: text; color: transparent;
            margin: 22px 0; word-break: break-all;
        }
        .hint { color: #94a3b8; font-size: 0.8rem; line-height: 1.6; }
        .status {
            display: inline-flex; align-items: center; gap: 7px;
            font-size: 0.72rem; color: #64748b; margin-top: 20px;
            text-transform: uppercase; letter-spacing: 1.5px;
            border: 1px solid var(--border); padding: 6px 14px; border-radius: 999px;
        }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: #64748b; }
        .dot.on { background: var(--primary); box-shadow: 0 0 10px var(--primary); }
        .err { color: #f87171; font-size: 0.85rem; margin-top: 8px; }
        a { color: var(--primary); text-decoration: none; }
        a:hover { text-decoration: underline; }
        .footer-tag { margin-top: 28px; font-size: 0.7rem; color: #475569; letter-spacing: 1px; }
    </style>
</head>
<body><div class="card">
    <img class="logo" src="${LOGO_URL}" alt="${config.botName}" />
    ${body}
    <div class="footer-tag">POWERED BY ${config.botName.toUpperCase()}</div>
</div></body>
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