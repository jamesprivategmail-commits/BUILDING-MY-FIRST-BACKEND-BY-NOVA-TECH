import { setWelcome, isWelcomeEnabled } from '../lib/settings.js';
import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'welcome',
    description: '.welcome on/off — greet new members (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const choice = (args[0] || '').toLowerCase();
        if (choice !== 'on' && choice !== 'off') {
            await sock.sendMessage(chatId, { text: `Welcome is currently *${isWelcomeEnabled(chatId) ? 'ON' : 'OFF'}*.\nUsage: .welcome on / .welcome off` }, { quoted: msg });
            return;
        }
        setWelcome(chatId, choice === 'on');
        await sock.sendMessage(chatId, { text: `👋 Welcome messages turned *${choice.toUpperCase()}*.` }, { quoted: msg });
    },
};