import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'pin',
    description: 'Reply to a message with .pin to pin it (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!quotedId) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a message with .pin' }, { quoted: msg });
            return;
        }
        try {
            await sock.sendMessage(chatId, {
                pin: { type: 1, time: 604800, key: { remoteJid: chatId, id: quotedId, participant: quotedParticipant } },
            });
            await sock.sendMessage(chatId, { text: '📌 Message pinned.' }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};