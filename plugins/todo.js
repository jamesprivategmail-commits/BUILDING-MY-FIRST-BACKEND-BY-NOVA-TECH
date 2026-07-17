import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TODO_PATH = path.join(__dirname, '..', 'data', 'todos.json');

function readTodos() {
    try {
        return JSON.parse(fs.readFileSync(TODO_PATH, 'utf8'));
    } catch {
        return {};
    }
}

function writeTodos(todos) {
    fs.writeFileSync(TODO_PATH, JSON.stringify(todos, null, 2));
}

export default {
    command: 'todo',
    description: '.todo add <task> / .todo list / .todo done <number>',
    async handler(sock, msg, args, { chatId }) {
        const todos = readTodos();
        if (!todos[chatId]) todos[chatId] = [];
        const [action, ...rest] = args;

        if (action === 'add') {
            const task = rest.join(' ');
            if (!task) {
                await sock.sendMessage(chatId, { text: '❌ Usage: .todo add <task>' }, { quoted: msg });
                return;
            }
            todos[chatId].push(task);
            writeTodos(todos);
            await sock.sendMessage(chatId, { text: `✅ Added: ${task}` }, { quoted: msg });
        } else if (action === 'done') {
            const idx = parseInt(rest[0]) - 1;
            if (isNaN(idx) || !todos[chatId][idx]) {
                await sock.sendMessage(chatId, { text: '❌ Usage: .todo done <number> — check .todo list for numbers' }, { quoted: msg });
                return;
            }
            const removed = todos[chatId].splice(idx, 1);
            writeTodos(todos);
            await sock.sendMessage(chatId, { text: `✅ Completed: ${removed[0]}` }, { quoted: msg });
        } else {
            const list = todos[chatId];
            const text = list.length
                ? `📋 *To-Do List*\n\n${list.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
                : '📭 No tasks yet. Add one with .todo add <task>';
            await sock.sendMessage(chatId, { text }, { quoted: msg });
        }
    },
};