function formatUptime(seconds) {
    const s = Math.floor(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
}

const CATEGORIES = {
    'ʙᴏᴛ ᴏᴡɴᴇʀ': ['self', 'public', 'block', 'unblock', 'owner'],
    'ɢʀᴏᴜᴘ': ['tagall', 'kick', 'antilink'],
    'sᴛɪᴄᴋᴇʀs': ['sticker', 's', 'toimg'],
    'ɢᴇɴᴇʀᴀʟ': ['ping', 'menu', 'help', 'alive', 'info', 'about', 'jid', 'getpp', 'pp', 'vv', 'ai', 'ask'],
};

export default {
    command: 'menu',
    aliases: ['help'],
    description: 'List available commands',
    async handler(sock, msg, args, { chatId, config, commandsMap }) {
        const seen = new Set();
        const allCommands = [];
        for (const plugin of commandsMap.values()) {
            if (seen.has(plugin.command)) continue;
            seen.add(plugin.command);
            allCommands.push(plugin.command);
        }

        const pushname = msg.pushName || 'User';

        let header =
`❐✦ *ɴᴏᴠᴀ ᴛᴇᴄʜ ᴠ2* ✦❐
┃» *ʙᴏᴛ ɴᴀᴍᴇ* : ɴᴏᴠᴀ ᴛᴇᴄʜ
┃» *ᴜsᴇʀɴᴀᴍᴇ* : ${pushname}
┃» *ᴜᴘᴛɪᴍᴇ* : ${formatUptime(process.uptime())}
┃» *ᴏᴡɴᴇʀ* : ${config.botOwner}
┃» *ᴘʀᴇғɪx* : [ ${config.prefix} ]
┗❐

`;

        let body = '';
        const categorized = new Set();

        for (const [category, cmds] of Object.entries(CATEGORIES)) {
            const present = cmds.filter((c) => allCommands.includes(c));
            if (!present.length) continue;
            present.forEach((c) => categorized.add(c));
            body += `┏❐ ${category}\n`;
            present.forEach((c, i) => {
                const branch = i === present.length - 1 ? '└' : '├';
                body += `┃ ${branch} ${config.prefix}${c}\n`;
            });
            body += `┗❐\n\n`;
        }

        const uncategorized = allCommands.filter((c) => !categorized.has(c));
        if (uncategorized.length) {
            body += `┏❐ ᴍɪsᴄ\n`;
            uncategorized.forEach((c, i) => {
                const branch = i === uncategorized.length - 1 ? '└' : '├';
                body += `┃ ${branch} ${config.prefix}${c}\n`;
            });
            body += `┗❐\n\n`;
        }

        const footer = `📢 Follow: https://whatsapp.com/channel/0029VbDJE4mFy729upfVIu0Q`;

        const text = header + body + footer;

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