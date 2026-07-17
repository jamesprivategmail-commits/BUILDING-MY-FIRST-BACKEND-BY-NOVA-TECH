export default {
    command: 'jid',
    description: 'Get this chat\'s WhatsApp ID',
    async handler(sock, msg, args, { chatId }) {
        await sock.sendMessage(chatId, { text: `🆔 Chat ID:\n${chatId}` }, { quoted: msg });
    },
};