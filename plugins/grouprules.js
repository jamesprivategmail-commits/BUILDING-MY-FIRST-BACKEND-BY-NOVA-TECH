import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isSenderAdmin } from '../lib/groupUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULES_PATH = path.join(__dirname, '..', 'data', 'rules.json');

function readRules() {
    try {
        return JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));
    } catch {
        return {};
    }
}

function writeRules(rules) {
    fs.writeFileSync(RULES_PATH, JSON.stringify(rules, null, 2));
}

export default {
    command: 'grouprules',
    aliases: ['rules'],
    description: '.rules to view, .rules set <text> to update (admin only to set)',
    async handler(sock, msg, args, { chatId }) {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ This only works in groups.' }, { quoted: msg });
            return;
        }
        const rules = readRules();

        if (args[0]?.toLowerCase() === 'set') {
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const allowed = msg.key.fromMe || (await isSenderAdmin(sock, chatId, senderJid));
            if (!allowed) {
                await sock.sendMessage(chatId, { text: '🚫 Only group admins can set rules.' }, { quoted: msg });
                return;
            }
            const text = args.slice(1).join(' ');
            if (!text) {
                await sock.sendMessage(chatId, { text: '❌ Usage: .rules set <rules text>' }, { quoted: msg });
                return;
            }
            rules[chatId] = text;
            writeRules(rules);
            await sock.sendMessage(chatId, { text: '✅ Group rules updated.' }, { quoted: msg });
            return;
        }

        const text = rules[chatId] || 'No rules set for this group yet. Admins can set them with .rules set <text>';
        await sock.sendMessage(chatId, { text: `📜 *Group Rules*\n\n${text}` }, { quoted: msg });
    },
};