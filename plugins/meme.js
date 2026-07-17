export default {
    command: 'meme',
    description: 'Get a random meme',
    async handler(sock, msg, args, { chatId }) {
        try {
            const res = await fetch('https://meme-api.com/gimme');
            const data = await res.json();
            await sock.sendMessage(chatId, { image: { url: data.url }, caption: data.title }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not fetch a meme right now.' }, { quoted: msg });
        }
    },
};