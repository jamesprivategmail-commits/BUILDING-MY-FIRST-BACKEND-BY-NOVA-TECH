export default {
    command: 'groupinfo',
    description: 'Show group details',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const admins = metadata.participants.filter((p) => p.admin).length;
        const text =
            `📋 *${metadata.subject}*\n\n` +
            `👥 Members: ${metadata.participants.length}\n` +
            `👑 Admins: ${admins}\n` +
            `📝 Description: ${metadata.desc || 'None'}\n` +
            `🆔 ID: ${chatId}`;
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};