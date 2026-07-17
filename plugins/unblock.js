export default {
    command: 'unblock',
    description: 'Reply to a user or send .unblock <number> to unblock them',
    async handler(sock, msg, args, { chatId }) {
        let targetJid;
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedParticipant) {
            targetJid = quotedParticipant;
        } else if (args[0]) {
            targetJid = `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        } else {
            await sock.sendMessage(chatId, { text: '❌ Usage: .unblock <number> or reply to a message' }, { quoted: msg });
            return;
        }

        await sock.updateBlockStatus(targetJid, 'unblock');
        await sock.sendMessage(chatId, { text: `✅ Unblocked ${targetJid.split('@')[0]}` }, { quoted: msg });
    },
};