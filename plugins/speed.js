export default {
    command: 'speed',
    description: 'Check bot response speed',
    async handler(sock, msg, args, { chatId }) {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: `⚡ Speed: ${Date.now() - start}ms` }, { quoted: msg });
    },
};