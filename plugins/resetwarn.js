import { isSenderAdmin } from '../lib/groupUtils.js';
import { resetWarn } from '../lib/settings.js';

export default {
    command: 'resetwarn',
    description: 'Reply to a member to clear their warnings (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a member with .resetwarn' }, { quoted: msg });
            return;
        }
        resetWarn(chatId, target.split('@')[0]);
        await sock.sendMessage(chatId, { text: `✅ Warnings cleared for @${target.split('@')[0]}`, mentions: [target] });
    },
};