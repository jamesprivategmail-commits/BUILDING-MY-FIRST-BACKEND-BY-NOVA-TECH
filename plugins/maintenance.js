import { setMode, getMode } from '../lib/settings.js';

export default {
    command: 'maintenance',
    description: '.maintenance on/off — temporarily restrict bot to owner only (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const choice = (args[0] || '').toLowerCase();
        if (choice !== 'on' && choice !== 'off') {
            await sock.sendMessage(chatId, { text: `Mode is currently *${getMode()}*.\nUsage: .maintenance on / .maintenance off` }, { quoted: msg });
            return;
        }
        setMode(choice === 'on' ? 'self' : 'public');
        await sock.sendMessage(chatId, { text: `🛠️ Maintenance mode *${choice.toUpperCase()}*.` }, { quoted: msg });
    },
};