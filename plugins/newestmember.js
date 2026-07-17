export default {
    command: 'newestmember',
    description: 'Show the most recently added group member',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const last = metadata.participants[metadata.participants.length - 1];
        await sock.sendMessage(chatId, { text: `🆕 Newest member: @${last.id.split('@')[0]}`, mentions: [last.id] }, { quoted: msg });
    },
};