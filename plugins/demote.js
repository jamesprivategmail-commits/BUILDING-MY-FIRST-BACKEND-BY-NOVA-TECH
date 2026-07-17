import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'demote',
    description: 'Reply to an admin to remove admin status (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const target = msg.message?.extendedTextMessage?.contextInfo?.participant || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
        if (!target) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a member or use .demote <number>' }, { quoted: msg });
            return;
        }
        await sock.groupParticipantsUpdate(chatId, [target], 'demote');
        await sock.sendMessage(chatId, { text: `✅ Demoted ${target.split('@')[0]}.` });
    },
};