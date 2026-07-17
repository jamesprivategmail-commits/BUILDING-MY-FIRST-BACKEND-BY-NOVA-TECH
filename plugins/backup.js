import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

export default {
    command: 'backup',
    description: 'Send the bot settings file as a backup (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        if (!fs.existsSync(SETTINGS_PATH)) {
            await sock.sendMessage(chatId, { text: '📭 No settings file yet.' }, { quoted: msg });
            return;
        }
        const buffer = fs.readFileSync(SETTINGS_PATH);
        await sock.sendMessage(chatId, {
            document: buffer,
            fileName: 'settings-backup.json',
            mimetype: 'application/json',
        }, { quoted: msg });
    },
};