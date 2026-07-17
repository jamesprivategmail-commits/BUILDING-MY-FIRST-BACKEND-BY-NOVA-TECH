import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    command: 'vv',
    description: 'Reply to a view-once media to resend it normally',
    async handler(sock, msg, args, { chatId }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a view-once photo/video with .vv' }, { quoted: msg });
            return;
        }

        const vvMsg =
            quoted.viewOnceMessageV2?.message ||
            quoted.viewOnceMessage?.message ||
            quoted;

        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const target = { message: vvMsg, key: { ...msg.key, id: stanzaId } };

        try {
            const buffer = await downloadMediaMessage(target, 'buffer', {});
            if (vvMsg.imageMessage) {
                await sock.sendMessage(chatId, { image: buffer, caption: vvMsg.imageMessage.caption || '' });
            } else if (vvMsg.videoMessage) {
                await sock.sendMessage(chatId, { video: buffer, caption: vvMsg.videoMessage.caption || '' });
            } else {
                await sock.sendMessage(chatId, { text: '❌ No view-once media found in that reply.' }, { quoted: msg });
            }
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ Couldn't retrieve media: ${err.message}` }, { quoted: msg });
        }
    },
};