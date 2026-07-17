export default {
    command: 'alive',
    description: 'Check if bot is alive and see uptime',
    async handler(sock, msg, args, { chatId, config }) {
        const uptime = Math.floor(process.uptime());
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;
        await sock.sendMessage(
            chatId,
            { text: `✅ *${config.botName}* is alive!\n⏱️ Uptime: ${h}h ${m}m ${s}s` },
            { quoted: msg }
        );
    },
};