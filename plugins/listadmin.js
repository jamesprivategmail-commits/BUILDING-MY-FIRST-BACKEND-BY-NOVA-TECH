export default {
    command: 'listadmin',
    description: 'List group admins',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const admins = metadata.participants.filter((p) => p.admin);
        const text = `👑 *Group Admins*\n\n${admins.map((a) => `• @${a.id.split('@')[0]}`).join('\n')}`;
        await sock.sendMessage(chatId, { text, mentions: admins.map((a) => a.id) }, { quoted: msg });
    },
};