import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    command: 'sticker',
    aliases: ['s'],
    description: 'Reply to an image with .sticker to convert it',
    async handler(sock, msg, args, { chatId }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const target = quoted
            ? { message: quoted, key: { ...msg.key, id: msg.message.extendedTextMessage.contextInfo.stanzaId } }
            : msg;

        const imageMsg = target.message?.imageMessage;
        if (!imageMsg) {
            await sock.sendMessage(chatId, { text: '❌ Reply to an image with .sticker' }, { quoted: msg });
            return;
        }

        const buffer = await downloadMediaMessage(target, 'buffer', {});
        const webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toBuffer();

        await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg });
    },
};