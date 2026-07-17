export default {
    command: 'blocklist',
    description: 'List all numbers blocked by the bot (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const list = await sock.fetchBlocklist();
        const text = list.length
            ? `🚫 *Blocked (${list.length})*\n\n${list.map((jid) => `• ${jid.split('@')[0]}`).join('\n')}`
            : '📭 No numbers blocked.';
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};