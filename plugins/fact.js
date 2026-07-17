export default {
    command: 'fact',
    description: 'Get a random fact',
    async handler(sock, msg, args, { chatId }) {
        try {
            const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
            const data = await res.json();
            await sock.sendMessage(chatId, { text: `🧠 ${data.text}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not fetch a fact right now.' }, { quoted: msg });
        }
    },
};