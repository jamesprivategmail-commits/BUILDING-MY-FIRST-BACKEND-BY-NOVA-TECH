import { setMode } from '../lib/settings.js';

export default {
    command: 'public',
    description: 'Allow anyone to use bot commands (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        setMode('public');
        await sock.sendMessage(chatId, { text: '✅ Bot is now in *public* mode — anyone can use commands.' }, { quoted: msg });
    },
};