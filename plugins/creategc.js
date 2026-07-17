export default {
    command: 'creategc',
    description: 'Create a new group — .creategc GroupName | number1,number2 (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const parts = args.join(' ').split('|').map((s) => s.trim());
        const groupName = parts[0];
        const numbers = (parts[1] || '').split(',').map((n) => n.trim().replace(/[^0-9]/g, '')).filter(Boolean);

        if (!groupName) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .creategc GroupName | number1,number2' }, { quoted: msg });
            return;
        }
        try {
            const participants = numbers.map((n) => `${n}@s.whatsapp.net`);
            const group = await sock.groupCreate(groupName, participants);
            await sock.sendMessage(chatId, { text: `✅ Created group "${groupName}" with ${participants.length} member(s).` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    },
};