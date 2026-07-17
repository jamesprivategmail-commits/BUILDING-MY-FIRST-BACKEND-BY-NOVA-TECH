export default {
    command: 'palindrome',
    description: 'Check if text is a palindrome — .palindrome <text>',
    async handler(sock, msg, args, { chatId }) {
        const text = args.join('').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!text) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .palindrome <text>' }, { quoted: msg });
            return;
        }
        const isPalindrome = text === text.split('').reverse().join('');
        await sock.sendMessage(chatId, { text: isPalindrome ? '✅ Yes, that\'s a palindrome!' : '❌ Not a palindrome.' }, { quoted: msg });
    },
};