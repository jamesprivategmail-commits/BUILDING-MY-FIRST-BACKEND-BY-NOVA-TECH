export default {
    command: 'mentionme',
    description: 'Mention yourself with a message',
    async handler(sock, msg, args, { chatId }) {
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const text = args.join(' ') || '👋';
        await sock.sendMessage(chatId, { text: `@${senderJid.split('@')[0]} ${text}`, mentions: [senderJid] }, { quoted: msg });
    },
};