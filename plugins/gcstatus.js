import { isAntilinkEnabled, isWelcomeEnabled, isGoodbyeEnabled } from '../lib/settings.js';

export default {
    command: 'gcstatus',
    description: 'Show this group\'s current bot settings',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }

        const metadata = await sock.groupMetadata(chatId);
        const admins = metadata.participants.filter((p) => p.admin).length;

        const text =
            `📊 *Group Status*\n\n` +
            `📛 Name: ${metadata.subject}\n` +
            `👥 Members: ${metadata.participants.length}\n` +
            `👑 Admins: ${admins}\n` +
            `🔒 Locked: ${metadata.announce ? 'Yes (only admins send)' : 'No'}\n\n` +
            `*Bot Features*\n` +
            `🔗 Antilink: ${isAntilinkEnabled(chatId) ? 'ON ✅' : 'OFF ❌'}\n` +
            `👋 Welcome: ${isWelcomeEnabled(chatId) ? 'ON ✅' : 'OFF ❌'}\n` +
            `👋 Goodbye: ${isGoodbyeEnabled(chatId) ? 'ON ✅' : 'OFF ❌'}`;

        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};