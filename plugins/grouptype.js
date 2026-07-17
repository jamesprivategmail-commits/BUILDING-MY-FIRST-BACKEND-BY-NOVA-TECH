export default {
    command: 'grouptype',
    description: 'Show group type (community-linked or standalone)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const text = metadata.linkedParent
            ? '🏘️ This group is linked to a Community.'
            : '👥 This is a standalone group.';
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};