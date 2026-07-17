export default {
    command: 'info',
    aliases: ['about'],
    description: 'Show bot info',
    async handler(sock, msg, args, { chatId, config, commandsMap }) {
        const uniqueCommands = new Set([...commandsMap.values()].map((p) => p.command)).size;
        const text =
            `*${config.botName}*\n\n` +
            `👤 Owner: ${config.botOwner}\n` +
            `⚙️ Prefix: ${config.prefix}\n` +
            `📦 Commands: ${uniqueCommands}\n` +
            `🕒 Timezone: ${config.timezone}`;
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};