const CHOICES = ['rock', 'paper', 'scissors'];

export default {
    command: 'rps',
    description: 'Play rock-paper-scissors — .rps rock',
    async handler(sock, msg, args, { chatId }) {
        const userChoice = (args[0] || '').toLowerCase();
        if (!CHOICES.includes(userChoice)) {
            await sock.sendMessage(chatId, { text: '❌ Usage: .rps rock/paper/scissors' }, { quoted: msg });
            return;
        }
        const botChoice = CHOICES[Math.floor(Math.random() * 3)];
        let result;
        if (userChoice === botChoice) result = "It's a tie!";
        else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) result = 'You win! 🎉';
        else result = 'I win! 🤖';

        await sock.sendMessage(chatId, { text: `You: ${userChoice}\nBot: ${botChoice}\n\n${result}` }, { quoted: msg });
    },
};