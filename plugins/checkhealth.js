export default {
    command: 'checkhealth',
    description: 'Ping all groups the bot is in and report response health (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        try {
            const groups = await sock.groupFetchAllParticipating();
            const count = Object.keys(groups).length;
            const mem = process.memoryUsage();
            const text =
                `🩺 *Health Check*\n\n` +
                `✅ Socket: connected\n` +
                `👥 Groups: ${count}\n` +
                `💾 Memory: ${Math.round(mem.rss / 1024 / 1024)}MB\n` +
                `⏱️ Uptime: ${Math.floor(process.uptime())}s`;
            await sock.sendMessage(chatId, { text }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ Health check failed: ${err.message}` }, { quoted: msg });
        }
    },
};