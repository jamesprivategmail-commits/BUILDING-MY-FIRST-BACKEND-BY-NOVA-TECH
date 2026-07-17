import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'checkadmin',
    description: 'Check if you (or a replied user) are a group admin',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const target = msg.message?.extendedTextMessage?.contextInfo?.participant || (msg.key.participant || msg.key.remoteJid);
        const admin = await isSenderAdmin(sock, chatId, target);
        await sock.sendMessage(chatId, { text: admin ? `✅ @${target.split('@')[0]} is a group admin.` : `❌ @${target.split('@')[0]} is not a group admin.`, mentions: [target] }, { quoted: msg });
    },
};