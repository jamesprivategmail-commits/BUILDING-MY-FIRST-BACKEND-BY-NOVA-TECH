import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'hidetag',
    description: 'Send a message that mentions everyone without showing the tag list (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants.map((p) => p.id);
        const text = args.length ? args.join(' ') : '📢';
        await sock.sendMessage(chatId, { text, mentions: participants });
    },
};