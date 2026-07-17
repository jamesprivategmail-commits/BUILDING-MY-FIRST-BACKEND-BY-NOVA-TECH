import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

function readSettings() {
    try {
        return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
        return { mode: 'public' };
    }
}

function writeSettings(settings) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export function getMode() {
    return readSettings().mode || 'public';
}

export function setMode(mode) {
    const settings = readSettings();
    settings.mode = mode;
    writeSettings(settings);
}