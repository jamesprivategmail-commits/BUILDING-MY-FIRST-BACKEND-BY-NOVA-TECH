import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'setdesc',
    description: 'Change group description (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const desc = args.join(' ');
        if (!desc) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .setdesc <new description>' }, { quoted: msg });
            return;
        }
        await sock.groupUpdateDescription(chatId, desc);
        await sock.sendMessage(chatId, { text: `✅ Group description updated.` });
    },
};