const TRUTHS = [
    "What's your biggest fear?",
    "What's the most embarrassing thing you've done?",
    "Who's your secret crush?",
    "What's a lie you've told recently?",
    "What's your weirdest habit?",
];

export default {
    command: 'truth',
    description: 'Get a random truth question',
    async handler(sock, msg, args, { chatId }) {
        const t = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
        await sock.sendMessage(chatId, { text: `🤫 Truth: ${t}` }, { quoted: msg });
    },
};