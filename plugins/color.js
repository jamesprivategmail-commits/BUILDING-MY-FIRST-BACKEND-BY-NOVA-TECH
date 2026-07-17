export default {
    command: 'color',
    description: 'Preview a hex color — .color #22c55e',
    async handler(sock, msg, args, { chatId }) {
        const hex = args[0]?.replace('#', '');
        if (!hex || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .color #RRGGBB, e.g. .color #22c55e' }, { quoted: msg });
            return;
        }
        const url = `https://singlecolorimage.com/get/${hex}/300x150`;
        await sock.sendMessage(chatId, { image: { url }, caption: `🎨 #${hex}` }, { quoted: msg });
    },
};