export default {
    command: 'isbotadmin',
    description: 'Check if the bot itself is a group admin (needed for kick/promote/etc)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const metadata = await sock.groupMetadata(chatId);
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = metadata.participants.find((p) => p.id.startsWith(sock.user.id.split(':')[0]));
        const isAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
        await sock.sendMessage(chatId, { text: isAdmin ? '✅ Bot is a group admin.' : '❌ Bot is NOT a group admin — commands like .kick/.promote won\'t work.' }, { quoted: msg });
    },
};