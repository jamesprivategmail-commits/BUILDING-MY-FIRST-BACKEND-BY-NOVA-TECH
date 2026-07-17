export async function isSenderAdmin(sock, chatId, senderJid) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participant = metadata.participants.find((p) => p.id === senderJid);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}