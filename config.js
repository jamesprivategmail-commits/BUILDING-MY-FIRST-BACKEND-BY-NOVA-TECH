import 'dotenv/config';

export default {
    botName: process.env.BOT_NAME || 'Nova Tech V2',
    botOwner: process.env.BOT_OWNER || 'Nova Tech',
    prefix: process.env.PREFIX || '.',
    port: process.env.PORT || 5000,
    // No + sign, digits only. Optional — leave empty and use the web
    // pairing page to choose a number at pairing time instead.
    ownerNumber: (process.env.OWNER_NUMBER || '').replace(/[^0-9]/g, ''),
    timezone: process.env.TIMEZONE || 'UTC',
};