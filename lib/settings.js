import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

function readSettings() {
    try {
        return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
        return { mode: 'public', antilinkGroups: {}, welcomeGroups: {}, goodbyeGroups: {}, prefix: null, warnings: {} };
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

export function isAntilinkEnabled(groupId) {
    const settings = readSettings();
    return !!(settings.antilinkGroups && settings.antilinkGroups[groupId]);
}

export function setAntilink(groupId, enabled) {
    const settings = readSettings();
    if (!settings.antilinkGroups) settings.antilinkGroups = {};
    settings.antilinkGroups[groupId] = enabled;
    writeSettings(settings);
}

export function isWelcomeEnabled(groupId) {
    const settings = readSettings();
    return !!(settings.welcomeGroups && settings.welcomeGroups[groupId]);
}

export function setWelcome(groupId, enabled) {
    const settings = readSettings();
    if (!settings.welcomeGroups) settings.welcomeGroups = {};
    settings.welcomeGroups[groupId] = enabled;
    writeSettings(settings);
}

export function isGoodbyeEnabled(groupId) {
    const settings = readSettings();
    return !!(settings.goodbyeGroups && settings.goodbyeGroups[groupId]);
}

export function setGoodbye(groupId, enabled) {
    const settings = readSettings();
    if (!settings.goodbyeGroups) settings.goodbyeGroups = {};
    settings.goodbyeGroups[groupId] = enabled;
    writeSettings(settings);
}

export function getPrefix() {
    return readSettings().prefix;
}

export function setPrefix(prefix) {
    const settings = readSettings();
    settings.prefix = prefix;
    writeSettings(settings);
}

export function getWarnCount(groupId, userNumber) {
    const settings = readSettings();
    return settings.warnings?.[groupId]?.[userNumber] || 0;
}

export function addWarn(groupId, userNumber) {
    const settings = readSettings();
    if (!settings.warnings) settings.warnings = {};
    if (!settings.warnings[groupId]) settings.warnings[groupId] = {};
    settings.warnings[groupId][userNumber] = (settings.warnings[groupId][userNumber] || 0) + 1;
    writeSettings(settings);
    return settings.warnings[groupId][userNumber];
}

export function resetWarn(groupId, userNumber) {
    const settings = readSettings();
    if (settings.warnings?.[groupId]) delete settings.warnings[groupId][userNumber];
    writeSettings(settings);
}