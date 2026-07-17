export default {
    command: 'translate',
    aliases: ['tr'],
    description: 'Translate text — .translate <lang code> <text>, e.g. .translate es Hello',
    async handler(sock, msg, args, { chatId }) {
        const lang = args[0];
        const text = args.slice(1).join(' ');
        if (!lang || !text) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .translate <lang code> <text>, e.g. .translate es Hello' }, { quoted: msg });
            return;
        }
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`);
            const data = await res.json();
            await sock.sendMessage(chatId, { text: `🌐 ${data.responseData.translatedText}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Translation failed.' }, { quoted: msg });
        }
    },
};