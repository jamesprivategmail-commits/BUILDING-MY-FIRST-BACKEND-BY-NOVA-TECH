const COMPLIMENTS = [
    "You light up every room you walk into.",
    "Your energy is contagious in the best way.",
    "You have great taste — you use this bot.",
    "You're smarter than you give yourself credit for.",
    "The world's better with you in it.",
];

export default {
    command: 'compliment',
    description: 'Get a random compliment',
    async handler(sock, msg, args, { chatId }) {
        const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
        await sock.sendMessage(chatId, { text: `✨ ${c}` }, { quoted: msg });
    },
};