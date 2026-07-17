import { setMode } from '../lib/settings.js';

export default {
    command: 'self',
    description: 'Restrict bot commands to owner only (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        setMode('self');
        await sock.sendMessage(chatId, { text: '🔒 Bot is now in *self* mode — only you can use commands.' }, { quoted: msg });
    },
};