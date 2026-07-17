export default {
    command: 'define',
    aliases: ['dict'],
    description: 'Get a word\'s definition — .define <word>',
    async handler(sock, msg, args, { chatId }) {
        const word = args[0];
        if (!word) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .define <word>' }, { quoted: msg });
            return;
        }
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (!res.ok) throw new Error('not found');
            const data = await res.json();
            const meaning = data[0]?.meanings?.[0];
            const def = meaning?.definitions?.[0]?.definition || 'No definition found.';
            const text = `📖 *${data[0].word}* (${meaning?.partOfSpeech || 'unknown'})\n\n${def}`;
            await sock.sendMessage(chatId, { text }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: `❌ No definition found for "${word}".` }, { quoted: msg });
        }
    },
};