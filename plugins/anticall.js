import { setAnticall, isAnticallEnabled } from '../lib/settings.js';

export default {
    command: 'anticall',
    description: '.anticall on/off — auto-reject and block callers (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const choice = (args[0] || '').toLowerCase();
        if (choice !== 'on' && choice !== 'off') {
            await sock.sendMessage(chatId, { text: `Anticall is currently *${isAnticallEnabled() ? 'ON' : 'OFF'}*.\nUsage: .anticall on / .anticall off` }, { quoted: msg });
            return;
        }
        setAnticall(choice === 'on');
        await sock.sendMessage(chatId, { text: `📵 Anticall turned *${choice.toUpperCase()}*.` }, { quoted: msg });
    },
};