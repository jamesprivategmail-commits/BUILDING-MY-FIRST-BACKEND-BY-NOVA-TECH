export default {
    command: 'listgroups',
    description: 'List all groups the bot is in (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const groups = await sock.groupFetchAllParticipating();
        const list = Object.values(groups);
        const text = list.length
            ? `📋 *Groups (${list.length})*\n\n${list.map((g) => `• ${g.subject}`).join('\n')}`
            : '📭 Not in any groups.';
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};