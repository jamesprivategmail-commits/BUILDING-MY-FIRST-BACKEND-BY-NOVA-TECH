export default {
    command: 'time',
    description: 'Get current time — .time or .time <timezone>, e.g. .time Asia/Tokyo',
    async handler(sock, msg, args, { chatId }) {
        const tz = args[0] || 'UTC';
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                dateStyle: 'full',
                timeStyle: 'medium',
            });
            await sock.sendMessage(chatId, { text: `🕐 ${tz}:\n${formatter.format(new Date())}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Invalid timezone. Try e.g. .time Africa/Lagos or .time America/New_York' }, { quoted: msg });
        }
    },
};