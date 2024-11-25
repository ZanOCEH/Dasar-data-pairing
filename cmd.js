/*
 • Fitur By Anomaki Team
 • Created : Nazand Code
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
*/

export const cmd = async (core, message, chatUpdate, store) => {
    const msg = message.message?.conversation || '';
    const from = message.key.remoteJid;

    if (msg.startsWith('!ping')) {
        await core.sendMessage(from, { text: 'Pong!' });
    } else if (msg.startsWith('!echo')) {
        const text = msg.slice(6);
        await core.sendMessage(from, { text: text || 'Ketik sesuatu setelah !echo untuk mengulang.' });
    } else if (msg.startsWith('!menu')) {
        const menuText = `
*Menu Bot*
1. !ping - Bot akan merespon "Pong!"
2. !echo <text> - Bot akan mengulang teks Anda.
3. !help - Menampilkan daftar perintah ini.
`;
        await core.sendMessage(from, { text: menuText });
    } else if (msg.startsWith('!help')) {
        await core.sendMessage(from, { text: 'Ketik !menu untuk melihat daftar perintah.' });
    }
};