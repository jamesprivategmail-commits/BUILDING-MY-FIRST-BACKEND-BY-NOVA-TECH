import { randomDelay } from '../lib/antiban.js';

export default {
    command: 'broadcast',
    aliases: ['bc'],
    description: 'Send a message to all groups the bot is in (owner only)',
    async handler(sock, msg, args, { chatId }) {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '🚫 Owner-only command.' }, { quoted: msg });
            return;
        }
        const message = args.join(' ');
        if (!message) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .broadcast <message>' }, { quoted: msg });
            return;
        }

        const groups = await sock.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);
        let sent = 0;

        await sock.sendMessage(chatId, { text: `📢 Broadcasting to ${groupIds.length} group(s), this'll take a bit to avoid rate limits...` }, { quoted: msg });

        for (const gid of groupIds) {
            try {
                await sock.sendMessage(gid, { text: `📢 *Broadcast*\n\n${message}` });
                sent++;
                await randomDelay(); // spread sends out — avoids looking like spam
            } catch (_e) {}
        }
        await sock.sendMessage(chatId, { text: `✅ Broadcast sent to ${sent}/${groupIds.length} groups.` }, { quoted: msg });
    },
};