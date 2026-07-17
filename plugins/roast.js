const ROASTS = [
    "You're proof that even bots have low standards for friends.",
    "You bring everyone so much joy... when you leave the room.",
    "I'd agree with you but then we'd both be wrong.",
    "You have something on your chin... no, the third one down.",
    "You're not stupid; you just have bad luck thinking.",
];

export default {
    command: 'roast',
    description: 'Get a playful roast',
    async handler(sock, msg, args, { chatId }) {
        const r = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        await sock.sendMessage(chatId, { text: `🔥 ${r}` }, { quoted: msg });
    },
};