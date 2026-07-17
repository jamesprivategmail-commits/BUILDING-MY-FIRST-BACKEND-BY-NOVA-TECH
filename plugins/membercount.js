export default {
    command: 'membercount',
    aliases: ['mc'],
    description: 'Show the number of group members',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        await sock.sendMessage(chatId, { text: `👥 Members: ${metadata.participants.length}` }, { quoted: msg });
    },
};