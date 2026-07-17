import { setGoodbye, isGoodbyeEnabled } from '../lib/settings.js';
import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'goodbye',
    description: '.goodbye on/off — farewell leaving members (admin only)',
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
            await sock.sendMessage(chatId, { text: `Goodbye is currently *${isGoodbyeEnabled(chatId) ? 'ON' : 'OFF'}*.\nUsage: .goodbye on / .goodbye off` }, { quoted: msg });
            return;
        }
        setGoodbye(chatId, choice === 'on');
        await sock.sendMessage(chatId, { text: `👋 Goodbye messages turned *${choice.toUpperCase()}*.` }, { quoted: msg });
    },
};