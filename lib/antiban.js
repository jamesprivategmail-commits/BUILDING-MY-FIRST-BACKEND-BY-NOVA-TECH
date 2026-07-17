const userTimestamps = new Map();

const WINDOW_MS = 10_000;
const MAX_COMMANDS_PER_WINDOW = 5;       // regular users
const MAX_COMMANDS_PER_WINDOW_OWNER = 12; // owner gets more headroom, but still capped

export function isRateLimited(userJid, isOwner = false) {
    const now = Date.now();
    const limit = isOwner ? MAX_COMMANDS_PER_WINDOW_OWNER : MAX_COMMANDS_PER_WINDOW;
    const timestamps = (userTimestamps.get(userJid) || []).filter((t) => now - t < WINDOW_MS);

    if (timestamps.length >= limit) {
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
// ANY two messages the bot sends, across every chat, with a brief
// "typing..." beat before text replies. Also collapses identical
// messages sent back-to-back to the same chat (common spam signature).
let queueTail = Promise.resolve();
const lastSentPerChat = new Map();

export function wrapSendMessage(sock) {
    const original = sock.sendMessage.bind(sock);

    sock.sendMessage = (jid, content, options) => {
        const task = queueTail.then(async () => {
            const fingerprint = content?.text ? `${jid}:${content.text}` : null;
            if (fingerprint) {
                const last = lastSentPerChat.get(jid);
                if (last === content.text) {
                    // Same text sent twice in a row to the same chat — skip the
                    // extra artificial delay/typing but still send, just faster,
                    // to avoid stacking up duplicate-looking bursts.
                    return original(jid, content, options);
                }
                lastSentPerChat.set(jid, content.text);
            }

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

const adminActionTimestamps = new Map();
const ADMIN_ACTION_COOLDOWN_MS = 3000;

export function isAdminActionCoolingDown(groupId) {
    const last = adminActionTimestamps.get(groupId) || 0;
    const now = Date.now();
    if (now - last < ADMIN_ACTION_COOLDOWN_MS) return true;
    adminActionTimestamps.set(groupId, now);
    return false;
}

// Exponential backoff with jitter for reconnects — avoids hammering
// WhatsApp's servers with instant retry loops if the connection is
// flaky, which itself can look suspicious.
let reconnectAttempts = 0;

export function getReconnectDelay() {
    reconnectAttempts++;
    const base = Math.min(2000 * 2 ** (reconnectAttempts - 1), 60_000); // caps at 60s
    const jitter = Math.floor(Math.random() * 1000);
    return base + jitter;
}

export function resetReconnectAttempts() {
    reconnectAttempts = 0;
}