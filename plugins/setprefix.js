import { setPrefix } from '../lib/settings.js';

export default {
    command: 'setprefix',
    description: 'Change the command prefix (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length > 3) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .setprefix <symbol> (max 3 chars)' }, { quoted: msg });
            return;
        }
        setPrefix(newPrefix);
        await sock.sendMessage(chatId, { text: `✅ Prefix changed to: ${newPrefix}` }, { quoted: msg });
    },
};