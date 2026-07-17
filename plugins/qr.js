export default {
    command: 'qr',
    description: 'Generate a QR code — .qr <text>',
    async handler(sock, msg, args, { chatId }) {
        const text = args.join(' ');
        if (!text) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .qr <text or link>' }, { quoted: msg });
            return;
        }
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
        await sock.sendMessage(chatId, { image: { url }, caption: '📱 QR Code' }, { quoted: msg });
    },
};