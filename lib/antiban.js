const userTimestamps = new Map();

const WINDOW_MS = 10_000;
const MAX_COMMANDS_PER_WINDOW = 5;

export function isRateLimited(userJid) {
    const now = Date.now();
    const timestamps = (userTimestamps.get(userJid) || []).filter((t) => now - t < WINDOW_MS);
    if (timestamps.length >= MAX_COMMANDS_PER_WINDOW) {
        userTimestamps.set(userJid, timestamps);
        return true;
    }
    timestamps.push(now);
    userTimestamps.set(userJid, timestamps);
    return false;
}

export function randomDelay(minMs = 1500, maxMs = 4000) {
    const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Global outgoing message queue — enforces a human-like gap between
// ANY two messages the bot sends, across every chat, plus a brief
// "typing..." beat before text replies.
let queueTail = Promise.resolve();

export function wrapSendMessage(sock) {
    const original = sock.sendMessage.bind(sock);

    sock.sendMessage = (jid, content, options) => {
        const task = queueTail.then(async () => {
            await randomDelay(400, 1200);
            if (content?.text) {
                try {
                    await sock.sendPresenceUpdate('composing', jid);
                    await randomDelay(500, 1500);
                } catch (_e) {}
            }
            return original(jid, content, options);
        });
        queueTail = task.catch(() => {});
        return task;
    };
}

// Extra cooldown for higher-risk group admin actions (kick/promote/demote/tagall)
const adminActionTimestamps = new Map();
const ADMIN_ACTION_COOLDOWN_MS = 3000;

export function isAdminActionCoolingDown(groupId) {
    const last = adminActionTimestamps.get(groupId) || 0;
    const now = Date.now();
    if (now - last < ADMIN_ACTION_COOLDOWN_MS) return true;
    adminActionTimestamps.set(groupId, now);
    return false;
}