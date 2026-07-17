import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { printLog } from './print.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsDir = path.join(__dirname, '..', 'plugins');

/**
 * Loads every .js file in /plugins. Each file must have a default export:
 * {
 *   command: 'ping',
 *   aliases: ['p'],           // optional
 *   description: 'Check bot latency',
 *   handler: async (sock, msg, args, context) => { ... }
 * }
 */
export async function loadPlugins() {
    const commands = new Map();

    if (!fs.existsSync(pluginsDir)) {
        printLog('warning', 'No plugins directory found.');
        return commands;
    }

    const files = fs.readdirSync(pluginsDir).filter((f) => f.endsWith('.js'));

    for (const file of files) {
        try {
            const fileUrl = pathToFileURL(path.join(pluginsDir, file)).href;
            const mod = await import(fileUrl);
            const plugin = mod.default;

            if (!plugin || !plugin.command || typeof plugin.handler !== 'function') {
                printLog('warning', `Skipped ${file} — missing command/handler.`);
                continue;
            }

            commands.set(plugin.command, plugin);
            if (Array.isArray(plugin.aliases)) {
                for (const alias of plugin.aliases) commands.set(alias, plugin);
            }
        } catch (err) {
            printLog('error', `Failed to load plugin ${file}: ${err.message}`);
        }
    }

    printLog('success', `Loaded ${files.length} plugin file(s), ${commands.size} command(s) registered.`);
    return commands;
}