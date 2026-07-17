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

        const text = `*${config.botName}*\n\n${lines.join('\n')}\n\n📢 Follow: https://whatsapp.com/channel/0029VbDJE4mFy729upfVIu0Q`;

        await sock.sendMessage(
            chatId,
            {
                image: { url: 'https://i.postimg.cc/rFNpnfLp/ec3d253c8d0e4cd9684279e98b02b343.jpg' },
                caption: text,
            },
            { quoted: msg }
        );
    },
};