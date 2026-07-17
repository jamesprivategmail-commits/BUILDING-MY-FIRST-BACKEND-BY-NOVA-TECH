const DARES = [
    "Send a voice note singing.",
    "Text your crush 'hi' right now.",
    "Post an embarrassing photo to your status.",
    "Speak in an accent for the next 5 messages.",
    "Do 10 pushups right now.",
];

export default {
    command: 'dare',
    description: 'Get a random dare',
    async handler(sock, msg, args, { chatId }) {
        const d = DARES[Math.floor(Math.random() * DARES.length)];
        await sock.sendMessage(chatId, { text: `🔥 Dare: ${d}` }, { quoted: msg });
    },
};