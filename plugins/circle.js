import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    command: 'circle',
    description: 'Reply to an image with .circle to make a circular sticker',
    async handler(sock, msg, args, { chatId }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage;
        if (!imageMsg) {
            await sock.sendMessage(chatId, { text: '❌ Reply to an image with .circle' }, { quoted: msg });
            return;
        }
        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const target = { message: quoted, key: { ...msg.key, id: stanzaId } };

        try {
            const buffer = await downloadMediaMessage(target, 'buffer', {});
            const size = 512;
            const circleSvg = Buffer.from(`<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);

            const resized = await sharp(buffer).resize(size, size, { fit: 'cover' }).toBuffer();
            const webp = await sharp(resized)
                .composite([{ input: circleSvg, blend: 'dest-in' }])
                .webp()
                .toBuffer();

            await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};