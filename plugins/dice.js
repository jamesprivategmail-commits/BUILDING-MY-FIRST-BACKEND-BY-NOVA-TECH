export default {
    command: 'dice',
    description: 'Roll a dice',
    async handler(sock, msg, args, { chatId }) {
        const roll = Math.floor(Math.random() * 6) + 1;
        await sock.sendMessage(chatId, { text: `🎲 You rolled: ${roll}` }, { quoted: msg });
    },
};