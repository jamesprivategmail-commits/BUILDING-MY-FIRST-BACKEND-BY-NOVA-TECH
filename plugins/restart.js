export default {
    command: 'restart',
    description: 'Restart the bot process (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        await sock.sendMessage(chatId, { text: '🔄 Restarting...' }, { quoted: msg });
        setTimeout(() => process.exit(0), 1000);
    },
};