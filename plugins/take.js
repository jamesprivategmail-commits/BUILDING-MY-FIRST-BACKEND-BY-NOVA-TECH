import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    command: 'take',
    description: 'Reply to a sticker with .take <packname> to re-tag it with your pack',
    async handler(sock, msg, args, { chatId, config }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.stickerMessage) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .take <packname>' }, { quoted: msg });
            return;
        }
        const packname = args.join(' ') || config.botName;
        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const target = { message: quoted, key: { ...msg.key, id: stanzaId } };

        try {
            const buffer = await downloadMediaMessage(target, 'buffer', {});
            const webp = await sharp(buffer).webp().toBuffer();
            await sock.sendMessage(chatId, { sticker: webp, packname, author: config.botOwner }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};