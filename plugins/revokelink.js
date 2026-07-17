import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'revokelink',
    description: 'Reset the group invite link, invalidating the old one (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        try {
            const code = await sock.groupRevokeInvite(chatId);
            await sock.sendMessage(chatId, { text: `🔄 New link: https://chat.whatsapp.com/${code}` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};