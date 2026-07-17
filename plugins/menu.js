export default {
    command: 'menu',
    aliases: ['help'],
    description: 'List available commands',
    async handler(sock, msg, args, { chatId, config, commandsMap }) {
        const seen = new Set();
        const lines = [];

        for (const plugin of commandsMap.values()) {
            if (seen.has(plugin.command)) continue;
            seen.add(plugin.command);
            lines.push(`• ${config.prefix}${plugin.command} — ${plugin.description || ''}`);
        }

        const text = `*${config.botName}*\n\n${lines.join('\n')}`;
        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};