export default {
    command: 'join',
    description: 'Join a group via invite link (owner only) — .join <link>',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const link = args[0];
        if (!link || !link.includes('chat.whatsapp.com/')) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .join <group invite link>' }, { quoted: msg });
            return;
        }
        const code = link.split('chat.whatsapp.com/')[1]?.split('?')[0];
        try {
            await sock.groupAcceptInvite(code);
            await sock.sendMessage(chatId, { text: '✅ Joined the group.' }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ Couldn't join: ${err.message}` }, { quoted: msg });
        }
    },
};