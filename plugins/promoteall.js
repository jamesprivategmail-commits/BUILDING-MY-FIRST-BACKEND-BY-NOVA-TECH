import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'promoteall',
    description: 'Promote all members to admin (admin only, use carefully)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const nonAdmins = metadata.participants.filter((p) => !p.admin).map((p) => p.id);
        if (!nonAdmins.length) {
            await sock.sendMessage(chatId, { text: 'ℹ️ Everyone is already an admin.' }, { quoted: msg });
            return;
        }
        await sock.groupParticipantsUpdate(chatId, nonAdmins, 'promote');
        await sock.sendMessage(chatId, { text: `✅ Promoted ${nonAdmins.length} member(s) to admin.` });
    },
};