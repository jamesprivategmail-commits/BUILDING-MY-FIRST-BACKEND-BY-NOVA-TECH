export default {
    command: 'ship',
    description: 'Reply to two people or mention them to get a compatibility score',
    async handler(sock, msg, args, { chatId }) {
        const name = args.join(' ') || 'You two';
        const score = Math.floor(Math.random() * 101);
        await sock.sendMessage(chatId, { text: `💞 ${name}: ${score}% compatible!` }, { quoted: msg });
    },
};