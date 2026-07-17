import { isSenderAdmin } from '../lib/groupUtils.js';
import { setAntilink, isAntilinkEnabled } from '../lib/settings.js';

export default {
    command: 'antilink',
    description: '.antilink on/off — auto-delete links in this group (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This command only works in groups.' }, { quoted: msg });
            return;
        }

        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }

        const choice = (args[0] || '').toLowerCase();
        if (choice !== 'on' && choice !== 'off') {
            const state = isAntilinkEnabled(chatId) ? 'ON' : 'OFF';
            await sock.sendMessage(chatId, { text: `Antilink is currently *${state}*.\nUsage: .antilink on / .antilink off` }, { quoted: msg });
            return;
        }

        setAntilink(chatId, choice === 'on');
        await sock.sendMessage(chatId, { text: `🔗 Antilink turned *${choice.toUpperCase()}* for this group.` }, { quoted: msg });
    },
};