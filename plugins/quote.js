export default {
    command: 'quote',
    description: 'Get an inspirational quote',
    async handler(sock, msg, args, { chatId }) {
        try {
            const res = await fetch('https://api.quotable.io/random');
            const data = await res.json();
            await sock.sendMessage(chatId, { text: `💬 "${data.content}"\n— ${data.author}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not fetch a quote right now.' }, { quoted: msg });
        }
    },
};