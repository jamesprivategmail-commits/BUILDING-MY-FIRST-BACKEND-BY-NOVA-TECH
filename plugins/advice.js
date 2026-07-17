export default {
    command: 'advice',
    description: 'Get random advice',
    async handler(sock, msg, args, { chatId }) {
        try {
            const res = await fetch('https://api.adviceslip.com/advice');
            const data = await res.json();
            await sock.sendMessage(chatId, { text: `💡 ${data.slip.advice}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not fetch advice right now.' }, { quoted: msg });
        }
    },
};