export default {
    command: 'runtime',
    description: 'Show bot uptime',
    async handler(sock, msg, args, { chatId }) {
        const uptime = Math.floor(process.uptime());
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;
        await sock.sendMessage(chatId, { text: `⏱️ Runtime: ${h}h ${m}m ${s}s` }, { quoted: msg });
    },
};