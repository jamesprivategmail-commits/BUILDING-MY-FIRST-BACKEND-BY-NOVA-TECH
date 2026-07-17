import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'tagall',
    description: 'Mention everyone in the group (admin only)',
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

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants.map((p) => p.id);
        const message = args.length ? args.join(' ') : '📢 Attention everyone!';
        const mentionText = participants.map((jid) => `@${jid.split('@')[0]}`).join(' ');

        await sock.sendMessage(chatId, { text: `${message}\n\n${mentionText}`, mentions: participants });
    },
};