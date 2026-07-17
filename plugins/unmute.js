import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'unmute',
    description: 'Everyone can send messages again (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, { text: '🔊 Group unmuted — everyone can send messages.' });
    },
};