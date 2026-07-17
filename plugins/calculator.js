export default {
    command: 'calculator',
    aliases: ['calc'],
    description: 'Calculate a math expression — .calc (12+8)*3/2',
    async handler(sock, msg, args, { chatId }) {
        const expr = args.join('');
        if (!expr) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .calc <expression>, e.g. .calc (12+8)*3/2' }, { quoted: msg });
            return;
        }
        if (!/^[0-9+\-*/().\s%]+$/.test(expr)) {
            await sock.sendMessage(chatId, { text: '❌ Only numbers and + - * / ( ) % are allowed.' }, { quoted: msg });
            return;
        }
        try {
            const result = Function(`"use strict"; return (${expr})`)();
            if (!isFinite(result)) throw new Error('Invalid result');
            await sock.sendMessage(chatId, { text: `🧮 ${expr} = *${result}*` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Invalid expression.' }, { quoted: msg });
        }
    },
};