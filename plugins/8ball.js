const ANSWERS = [
    'Yes, definitely.', 'No way.', 'Ask again later.', 'Absolutely!',
    'Very doubtful.', 'It is certain.', 'Cannot predict now.', 'Most likely.',
];

export default {
    command: '8ball',
    description: 'Ask the magic 8-ball a question',
    async handler(sock, msg, args, { chatId }) {
        if (!args.length) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .8ball <question>' }, { quoted: msg });
            return;
        }
        const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
        await sock.sendMessage(chatId, { text: `🎱 ${answer}` }, { quoted: msg });
    },
};