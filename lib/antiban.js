const userTimestamps = new Map();

const WINDOW_MS = 10_000; // 10 seconds
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

// Random delay helper — makes bulk sends (broadcast) look less bot-like.
export function randomDelay(minMs = 1500, maxMs = 4000) {
    const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, ms));
}