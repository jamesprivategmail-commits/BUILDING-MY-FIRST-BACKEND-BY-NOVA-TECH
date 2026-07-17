export default {
    command: 'ping',
    aliases: ['p'],
    description: 'Check bot latency',
    async handler(sock, msg, args, { chatId }) {
        const start = Date.now();
        const sent = await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: msg });
        const latency = Date.now() - start;
        await sock.sendMessage(chatId, { text: `🏓 Pong! ${latency}ms`, edit: sent.key }).catch(async () => {
            // Fallback if edit isn't supported by this Baileys version
            await sock.sendMessage(chatId, { text: `🏓 Pong! ${latency}ms` });
        });
    },
};