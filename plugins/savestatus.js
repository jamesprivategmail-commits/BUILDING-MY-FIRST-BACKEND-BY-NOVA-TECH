import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    command: 'savestatus',
    aliases: ['ss'],
    description: 'Reply to a status update you\'ve viewed to save it (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a status update with .savestatus' }, { quoted: msg });
            return;
        }

        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const participant = msg.message.extendedTextMessage.contextInfo.participant;
        const target = { message: quoted, key: { remoteJid: 'status@broadcast', id: stanzaId, participant } };

        try {
            const buffer = await downloadMediaMessage(target, 'buffer', {});
            if (quoted.imageMessage) {
                await sock.sendMessage(chatId, { image: buffer, caption: '💾 Saved status' });
            } else if (quoted.videoMessage) {
                await sock.sendMessage(chatId, { video: buffer, caption: '💾 Saved status' });
            } else {
                await sock.sendMessage(chatId, { text: '❌ Only image/video statuses are supported.' }, { quoted: msg });
            }
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ Couldn't save: ${err.message}` }, { quoted: msg });
        }
    },
};