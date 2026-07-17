export default {
    command: 'autobio',
    description: 'Set the bot WhatsApp About text (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const bio = args.join(' ');
        if (!bio) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .autobio <text>' }, { quoted: msg });
            return;
        }
        await sock.updateProfileStatus(bio);
        await sock.sendMessage(chatId, { text: `✅ Bio updated to: ${bio}` }, { quoted: msg });
    },
};