import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'lockgroup',
    description: 'Only admins can edit group settings (name/photo/desc) (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        await sock.groupSettingUpdate(chatId, 'locked');
        await sock.sendMessage(chatId, { text: '🔒 Group settings locked — only admins can edit name/photo/description.' });
    },
};