export default {
    command: 'groupowner',
    description: 'Show who created the group',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        if (!metadata.owner) {
            await sock.sendMessage(chatId, { text: 'ℹ️ Group creator info not available (common for older/community groups).' }, { quoted: msg });
            return;
        }
        await sock.sendMessage(chatId, { text: `👑 Created by @${metadata.owner.split('@')[0]}`, mentions: [metadata.owner] }, { quoted: msg });
    },
};