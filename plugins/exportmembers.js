export default {
    command: 'exportmembers',
    description: 'Export all group member numbers as a text file (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const metadata = await sock.groupMetadata(chatId);
        const numbers = metadata.participants.map((p) => p.id.split('@')[0]).join('\n');
        const buffer = Buffer.from(numbers, 'utf8');
        await sock.sendMessage(chatId, {
            document: buffer,
            fileName: `${metadata.subject}-members.txt`,
            mimetype: 'text/plain',
        }, { quoted: msg });
    },
};