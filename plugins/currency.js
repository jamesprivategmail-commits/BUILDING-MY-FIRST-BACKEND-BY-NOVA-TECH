export default {
    command: 'currency',
    aliases: ['conv'],
    description: 'Convert currency — .currency 100 USD NGN',
    async handler(sock, msg, args, { chatId }) {
        const [amount, from, to] = args;
        if (!amount || !from || !to || isNaN(amount)) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .currency <amount> <from> <to>, e.g. .currency 100 USD NGN' }, { quoted: msg });
            return;
        }
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`);
            const data = await res.json();
            const rate = data.rates?.[to.toUpperCase()];
            if (!rate) {
                await sock.sendMessage(chatId, { text: '❌ Unknown currency code.' }, { quoted: msg });
                return;
            }
            const result = (parseFloat(amount) * rate).toFixed(2);
            await sock.sendMessage(chatId, { text: `💱 ${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}` }, { quoted: msg });
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Conversion failed.' }, { quoted: msg });
        }
    },
};