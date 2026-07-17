import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'setname',
    description: 'Change group name (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const name = args.join(' ');
        if (!name) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .setname <new name>' }, { quoted: msg });
            return;
        }
        await sock.groupUpdateSubject(chatId, name);
        await sock.sendMessage(chatId, { text: `✅ Group name changed to: ${name}` });
    },
};