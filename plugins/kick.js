import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'kick',
    description: 'Reply to a member or .kick <number> to remove them (admin only)',
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

        let targetJid;
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedParticipant) {
            targetJid = quotedParticipant;
        } else if (args[0]) {
            targetJid = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        } else {
            await sock.sendMessage(chatId, { text: '❌ Reply to a member or use .kick <number>' }, { quoted: msg });
            return;
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [targetJid], 'remove');
            await sock.sendMessage(chatId, { text: `✅ Removed ${targetJid.split('@')[0]}` });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ Couldn't remove — make sure the bot is a group admin. (${err.message})` }, { quoted: msg });
        }
    },
};