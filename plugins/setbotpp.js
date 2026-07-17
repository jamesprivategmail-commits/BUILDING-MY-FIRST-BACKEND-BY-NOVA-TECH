import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    command: 'setbotpp',
    description: 'Reply to an image with .setbotpp to set it as bot profile picture (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage;
        if (!imageMsg) {
            await sock.sendMessage(chatId, { text: '❌ Reply to an image with .setbotpp' }, { quoted: msg });
            return;
        }
        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const target = { message: quoted, key: { ...msg.key, id: stanzaId } };
        const buffer = await downloadMediaMessage(target, 'buffer', {});
        await sock.updateProfilePicture(sock.user.id, buffer);
        await sock.sendMessage(chatId, { text: '✅ Bot profile picture updated.' }, { quoted: msg });
    },
};