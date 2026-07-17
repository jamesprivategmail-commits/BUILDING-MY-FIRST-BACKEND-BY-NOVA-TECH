export default {
    command: 'leave',
    description: 'Make the bot leave this group (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        await sock.sendMessage(chatId, { text: '👋 Leaving this group...' });
        await sock.groupLeave(chatId);
    },
};