export default {
    command: 'poll',
    description: 'Create a poll — .poll Question | Option1 | Option2',
    async handler(sock, msg, args, { chatId }) {
        const parts = args.join(' ').split('|').map((s) => s.trim()).filter(Boolean);
        if (parts.length < 3) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .poll Question | Option1 | Option2 | ...' }, { quoted: msg });
            return;
        }
        const [name, ...options] = parts;
        await sock.sendMessage(chatId, { poll: { name, values: options, selectableCount: 1 } });
    },
};