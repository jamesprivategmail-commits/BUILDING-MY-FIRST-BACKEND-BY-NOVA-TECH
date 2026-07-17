export default {
    command: 'owner',
    aliases: ['contact'],
    description: 'Get owner contact / channel link',
    async handler(sock, msg, args, { chatId, config }) {
        const text =
            `*${config.botOwner}*\n\n` +
            `📢 Follow: https://whatsapp.com/channel/0029VbDJE4mFy729upfVIu0Q`;
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};