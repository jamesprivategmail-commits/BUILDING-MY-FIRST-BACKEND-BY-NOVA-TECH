export default {
    command: 'weather',
    description: 'Get current weather — .weather <city>',
    async handler(sock, msg, args, { chatId }) {
        const city = args.join(' ');
        if (!city) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .weather <city>' }, { quoted: msg });
            return;
        }
        try {
            const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+(feels+like+%f)+💧%h+💨%w`);
            const text = await res.text();
            await sock.sendMessage(chatId, { text: `🌤️ *${city}*\n${text.trim()}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Could not fetch weather right now.' }, { quoted: msg });
        }
    },
};