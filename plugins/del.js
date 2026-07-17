import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'del',
    aliases: ['delete'],
    description: 'Reply to a bot message to delete it (admin only in groups)',
    async handler(sock, msg, args, { chatId }) {
        const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!quotedId) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a message with .del to delete it.' }, { quoted: msg });
            return;
        }

        if (chatId.endsWith('@g.us')) {
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
            if (!allowed) {
                await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
                return;
            }
        }

        await sock.sendMessage(chatId, {
            delete: { remoteJid: chatId, id: quotedId, participant: quotedParticipant, fromMe: !quotedParticipant },
        });
    },
};