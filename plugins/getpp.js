export default {
    command: 'getpp',
    aliases: ['pp'],
    description: 'Reply to a user or send .getpp <number> to get their profile picture',
    async handler(sock, msg, args, { chatId }) {
        let targetJid;

        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedParticipant) {
            targetJid = quotedParticipant;
        } else if (args[0]) {
            const digits = args[0].replace(/[^0-9]/g, '');
            targetJid = `${digits}@s.whatsapp.net`;
        } else {
            targetJid = chatId;
        }

        try {
            const url = await sock.profilePictureUrl(targetJid, 'image');
            await sock.sendMessage(chatId, { image: { url }, caption: `📸 Profile picture` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: '❌ No profile picture found (or it\'s private).' }, { quoted: msg });
        }
    },
};