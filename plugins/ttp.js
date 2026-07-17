import sharp from 'sharp';

export default {
    command: 'ttp',
    description: 'Turn text into a sticker — .ttp <text>',
    async handler(sock, msg, args, { chatId }) {
        const text = args.join(' ');
        if (!text) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .ttp <text>' }, { quoted: msg });
            return;
        }
        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const svg = `
            <svg width="512" height="512">
                <rect width="100%" height="100%" fill="transparent"/>
                <text x="50%" y="50%" font-size="48" font-family="sans-serif" font-weight="bold"
                      fill="white" text-anchor="middle" dominant-baseline="middle">${escaped}</text>
            </svg>`;
        try {
            const webp = await sharp(Buffer.from(svg)).webp().toBuffer();
            await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};