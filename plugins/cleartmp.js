import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

export default {
    command: 'cleartmp',
    description: 'Clear temp/cache data (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        try {
            const files = fs.readdirSync(DATA_DIR).filter((f) => f !== 'settings.json');
            for (const f of files) fs.rmSync(path.join(DATA_DIR, f), { recursive: true, force: true });
            await sock.sendMessage(chatId, { text: `✅ Cleared ${files.length} temp file(s).` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};