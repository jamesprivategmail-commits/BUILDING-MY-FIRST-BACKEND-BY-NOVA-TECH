export default {
    command: 'play',
    description: 'Search for a song and get the YouTube link — .play <song name>',
    async handler(sock, msg, args, { chatId }) {
        const query = args.join(' ');
        if (!query) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .play <song name>' }, { quoted: msg });
            return;
        }
        try {
            const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
            const html = await res.text();
            const match = html.match(/"videoId":"(.*?)".*?"title":\{"runs":\[\{"text":"(.*?)"\}/);
            if (!match) {
                await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: msg });
                return;
            }
            const [, videoId, title] = match;
            const url = `https://youtu.be/${videoId}`;
            await sock.sendMessage(chatId, { text: `🎵 *${title}*\n${url}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Search failed.' }, { quoted: msg });
        }
    },
};