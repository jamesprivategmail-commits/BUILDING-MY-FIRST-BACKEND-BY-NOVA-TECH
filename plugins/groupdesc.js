export default {
    command: 'groupdesc',
    description: 'Show the group description',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        await sock.sendMessage(chatId, { text: `📝 *Description*\n\n${metadata.desc || 'No description set.'}` }, { quoted: msg });
    },
};