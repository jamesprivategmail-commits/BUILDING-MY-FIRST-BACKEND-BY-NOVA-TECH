export default {
    command: 'block',
    description: 'Reply to a user or send .block <number> to block them (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }

        let targetJid;
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedParticipant) {
            targetJid = quotedParticipant;
        } else if (args[0]) {
            targetJid = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        } else {
            await sock.sendMessage(chatId, { text: '❌ Usage: .block <number> or reply to a message' }, { quoted: msg });
            return;
        }

        await sock.updateBlockStatus(targetJid, 'block');
        await sock.sendMessage(chatId, { text: `🚫 Blocked ${targetJid.split('@')[0]}` }, { quoted: msg });
    },
};