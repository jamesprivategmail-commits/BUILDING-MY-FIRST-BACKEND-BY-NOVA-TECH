export default {
    command: 'password',
    aliases: ['genpass'],
    description: 'Generate a random password — .password <length>',
    async handler(sock, msg, args, { chatId }) {
        const length = Math.min(Math.max(parseInt(args[0]) || 12, 6), 64);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
        await sock.sendMessage(chatId, { text: `🔑 ${pass}` }, { quoted: msg });
    },
};