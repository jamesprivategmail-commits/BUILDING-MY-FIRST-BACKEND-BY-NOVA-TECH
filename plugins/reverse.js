export default {
    command: 'reverse',
    description: 'Reverse text — .reverse <text>',
    async handler(sock, msg, args, { chatId }) {
        const text = args.join(' ');
        if (!text) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .reverse <text>' }, { quoted: msg });
            return;
        }
        await sock.sendMessage(chatId, { text: text.split('').reverse().join('') }, { quoted: msg });
    },
};