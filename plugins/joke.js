export default {
    command: 'joke',
    description: 'Get a random joke',
    async handler(sock, msg, args, { chatId }) {
        try {
            const res = await fetch('https://official-joke-api.appspot.com/random_joke');
            const data = await res.json();
            await sock.sendMessage(chatId, { text: `😂 ${data.setup}\n\n${data.punchline}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not fetch a joke right now.' }, { quoted: msg });
        }
    },
};