import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'demoteall',
    description: 'Demote all admins except the group owner (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const admins = metadata.participants.filter((p) => p.admin === 'admin').map((p) => p.id);
        if (!admins.length) {
            await sock.sendMessage(chatId, { text: 'ℹ️ No regular admins to demote (superadmin/owner is protected).' }, { quoted: msg });
            return;
        }
        await sock.groupParticipantsUpdate(chatId, admins, 'demote');
        await sock.sendMessage(chatId, { text: `✅ Demoted ${admins.length} admin(s).` });
    },
};