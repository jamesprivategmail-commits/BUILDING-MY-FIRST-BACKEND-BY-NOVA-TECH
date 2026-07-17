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