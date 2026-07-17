export default {
    command: 'groupjid',
    description: 'Get this group\'s ID',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        await sock.sendMessage(chatId, { text: `🆔 Group ID:\n${chatId}` }, { quoted: msg });
    },
};