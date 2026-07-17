import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    command: 'toimg',
    description: 'Reply to a sticker to convert it into an image',
    async handler(sock, msg, args, { chatId }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.stickerMessage) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .toimg' }, { quoted: msg });
            return;
        }

        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const target = { message: quoted, key: { ...msg.key, id: stanzaId } };

        try {
            const buffer = await downloadMediaMessage(target, 'buffer', {});
            const png = await sharp(buffer).png().toBuffer();
            await sock.sendMessage(chatId, { image: png, caption: '🖼️ Converted to image' }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${err.message}` }, { quoted: msg });
        }
    },
};