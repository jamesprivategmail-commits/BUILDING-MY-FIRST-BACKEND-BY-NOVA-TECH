export default {
    command: 'binary',
    description: 'Convert text to binary or binary to text — .binary <text|binary>',
    async handler(sock, msg, args, { chatId }) {
        const input = args.join(' ');
        if (!input) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .binary <text> or .binary <binary code>' }, { quoted: msg });
            return;
        }
        const isBinary = /^[01\s]+$/.test(input);
        let result;
        if (isBinary) {
            result = input.trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join('');
        } else {
            result = input.split('').map((c) => c.charCodeAt(0).toString(2)).join(' ');
        }
        await sock.sendMessage(chatId, { text: result }, { quoted: msg });
    },
};