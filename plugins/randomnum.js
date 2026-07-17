export default {
    command: 'randomnum',
    aliases: ['rand'],
    description: 'Generate a random number — .randomnum <min> <max>',
    async handler(sock, msg, args, { chatId }) {
        const min = parseInt(args[0]) || 1;
        const max = parseInt(args[1]) || 100;
        if (min >= max) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .randomnum <min> <max>, e.g. .randomnum 1 100' }, { quoted: msg });
            return;
        }
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        await sock.sendMessage(chatId, { text: `🎲 ${result}` }, { quoted: msg });
    },
};