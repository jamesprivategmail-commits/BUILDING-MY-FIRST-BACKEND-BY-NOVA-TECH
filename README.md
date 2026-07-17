# Nova Tech V2

A lightweight WhatsApp multi-device bot built on [Baileys](https://github.com/WhiskeySockets/Baileys),
with a proper web-based pairing page — type any number, get a code, done.
No fixed `OWNER_NUMBER`, no terminal required.

## Features

- Web pairing page at `/pair-request` — choose your number at pair time
- Auto-reconnect on disconnect
- Auto-clears session and re-prompts pairing on logout
- Simple plugin system — drop a `.js` file in `plugins/` to add a command
- Status page at `/` and health check at `/health`

## Local setup

\`\`\`bash
npm install
cp .env.example .env
npm start
\`\`\`

Then visit `http://localhost:5000/pair-request`, enter your WhatsApp number
(country code + number, no `+`), and follow the code on your phone:
**WhatsApp → Linked Devices → Link a Device → Link with phone number instead**.

## Deploy on Render

1. Push this repo to GitHub
2. Render → New → Blueprint → connect the repo (it reads `render.yaml` automatically)
3. Deploy
4. Visit `https://your-app.onrender.com/pair-request` to pair

## Adding commands

Create a new file in `plugins/`, e.g. `plugins/hello.js`:

\`\`\`js
export default {
    command: 'hello',
    aliases: ['hi'],
    description: 'Say hello',
    async handler(sock, msg, args, { chatId }) {
        await sock.sendMessage(chatId, { text: 'Hello there!' }, { quoted: msg });
    },
};
\`\`\`

It's auto-loaded on startup — no registration needed elsewhere.

## Environment variables

| Key | Required | Default | Notes |
|---|---|---|---|
| `BOT_NAME` | No | `Nova Tech V2` | Shown on status/pairing pages |
| `BOT_OWNER` | No | `Nova Tech` | |
| `PREFIX` | No | `.` | Command prefix |
| `PORT` | No | `5000` | |
| `OWNER_NUMBER` | No | — | Only needed if you want a fixed default; otherwise pair via the web page |

## Notes

- Free Render instances spin down on inactivity — use a pinger (e.g. UptimeRobot) if you need 24/7 uptime.
- Render's disk resets on redeploy, so re-pairing may be needed after each deploy unless you add persistent storage.