import { isSenderAdmin } from '../lib/groupUtils.js';
import { addWarn, getWarnCount } from '../lib/settings.js';

const MAX_WARNINGS = 3;

export default {
    command: 'warn',
    description: 'Reply to a member to warn them — 3 warnings auto-kicks (admin only)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) return;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
        if (!allowed) {
            await sock.sendMessage(chatId, { text: '🚫 Only group admins can use this.' }, { quoted: msg });
            return;
        }
        const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a member with .warn' }, { quoted: msg });
            return;
        }
        const targetNumber = target.split('@')[0];
        const count = addWarn(chatId, targetNumber);

        if (count >= MAX_WARNINGS) {
            await sock.sendMessage(chatId, { text: `⚠️ @${targetNumber} reached ${MAX_WARNINGS} warnings — removing.`, mentions: [target] });
            await sock.groupParticipantsUpdate(chatId, [target], 'remove');
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ @${targetNumber} warned (${count}/${MAX_WARNINGS})`, mentions: [target] });
        }
    },
};