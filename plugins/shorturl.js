export default {
    command: 'shorturl',
    aliases: ['short'],
    description: 'Shorten a URL — .shorturl <link>',
    async handler(sock, msg, args, { chatId }) {
        const link = args[0];
        if (!link || !link.startsWith('http')) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .shorturl <link starting with http>' }, { quoted: msg });
            return;
        }
        try {
            const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`);
            const short = await res.text();
            await sock.sendMessage(chatId, { text: `🔗 ${short}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not shorten that link.' }, { quoted: msg });
        }
    },
};