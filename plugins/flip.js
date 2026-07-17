export default {
    command: 'flip',
    description: 'Flip a coin',
    async handler(sock, msg, args, { chatId }) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await sock.sendMessage(chatId, { text: `🪙 ${result}!` }, { quoted: msg });
    },
};