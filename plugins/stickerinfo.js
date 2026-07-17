export default {
    command: 'stickerinfo',
    description: 'Reply to a sticker to see its pack/author info',
    async handler(sock, msg, args, { chatId }) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const sticker = quoted?.stickerMessage;
        if (!sticker) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .stickerinfo' }, { quoted: msg });
            return;
        }
        const text =
            `🏷️ *Sticker Info*\n\n` +
            `Animated: ${sticker.isAnimated ? 'Yes' : 'No'}\n` +
            `Size: ${sticker.fileLength ? Math.round(Number(sticker.fileLength) / 1024) + ' KB' : 'Unknown'}`;
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};