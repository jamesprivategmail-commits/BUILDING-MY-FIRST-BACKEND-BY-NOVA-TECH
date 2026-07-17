import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { isSenderAdmin } from '../lib/groupUtils.js';

export default {
    command: 'setppgc',
    description: 'Reply to an image with .setppgc to set it as group photo (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage;
        if (!imageMsg) {
            await sock.sendMessage(chatId, { text: '❌ Reply to an image with .setppgc' }, { quoted: msg });
            return;
        }
        const stanzaId = msg.message.extendedTextMessage.contextInfo.stanzaId;
        const target = { message: quoted, key: { ...msg.key, id: stanzaId } };
        const buffer = await downloadMediaMessage(target, 'buffer', {});
        await sock.updateProfilePicture(chatId, buffer);
        await sock.sendMessage(chatId, { text: '✅ Group photo updated.' });
    },
};