/*
  Base Ini Hasil Gabut aja, Jadi kalau kalian mau kembangin atau di perbarui silahkan
*/

  // * Code By Nazand Code
// * Fitur info gc simple (Dibuat Krn Gabut)
// * Hapus Wm Denda 500k Rupiah
// * https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import {
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    Browsers,
    makeWASocket
} from '@whiskeysockets/baileys';
import {
    logInfo,
    logSuccess,
    logError,
    logWarning,
    logPairingCode,
    logConnectionStatus
} from './main.js';
import { cmd } from './cmd.js';

class WhatsAppBot {
    constructor() {
        this.store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
        this.logger = pino({ level: 'silent', stream: 'store' });
    }

    async initialize() {
        const { state, saveCreds } = await useMultiFileAuthState(process.cwd() + '/files/sessions');
        const { version } = await fetchLatestBaileysVersion();
        const core = this.createConnection(version, state);
        this.store.bind(core.ev);
        await this.pairing(core);
        await this.events(core, saveCreds);
        return core;
    }

    createConnection(version, state) {
        return makeWASocket({
            version,
            logger: this.logger,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, this.logger)
            },
            mobile: false,
            printQRInTerminal: false,
            browser: Browsers.ubuntu('Chrome'),
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            retryRequestDelayMs: 10,
            transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
            maxMsgRetryCount: 15,
            appStateMacVerification: { patch: true, snapshot: true }
        });
    }

    async pairing(core) {
        if (core.authState && !core.authState.creds.registered) {
            const phone = await this.getPhoneNumber();
            setTimeout(async () => {
                let code = await core.requestPairingCode(phone);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                logPairingCode(code);
            }, 3000);
        } else {
            logSuccess('Tersambung Ke Whatsapp');
        }
    }

    async events(core, saveCreds) {
        if (core && core.ev) {
            core.ev.on('connection.update', async update => {
                const { connection, lastDisconnect } = update;
                logConnectionStatus(connection);
                if (connection === 'close') {
                    await this.handleDisconnection(new Boom(lastDisconnect?.error)?.output.statusCode);
                }
                if (connection === 'connecting') { /* handle connecting state */ }
                if (connection === 'open') { /* handle open connection state */ }
            });

            core.ev.on('creds.update', saveCreds);
            core.ev.on('messages.upsert', async (chatUpdate) => { 
                const m = chatUpdate.messages[0];
                if (!m.message) return;
                m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;
                this.processMessage(core, m, chatUpdate);
            });
        }
    }

    async handleDisconnection(reason) {
        switch (reason) {
            case DisconnectReason.badSession:
                logError('Sesi buruk, Hapus File Sessi Lalu Scan Ulang');
                break;
            case DisconnectReason.connectionClosed:
                logWarning('Koneksi Terputus, Menghubungkan ulang....');
                break;
            case DisconnectReason.connectionLost:
                logWarning('Koneksi Ilang dari server...');
                break;
            case DisconnectReason.connectionReplaced:
                logError('Connection Replaced, Another New Session Opened, Please Close Current Session First');
                break;
            case DisconnectReason.loggedOut:
                logError('Perangkat Keluar, Silahkan Scan Ulang');
                break;
            case DisconnectReason.restartRequired:
                logWarning('Sedang Merestart...');
                break;
            case DisconnectReason.timedOut:
                logWarning('Connection TimedOut, Reconnecting...');
                break;
            default:
                logError(`Unknown DisconnectReason: ${reason}`);
                break;
        }
        await this.initialize();
    }

    async getPhoneNumber() {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        return new Promise(resolve => {
            rl.question('Masukkan Nomor: ', num => {
                rl.close();
                resolve(num);
            });
        });
    }

    async processMessage(core, message, chatUpdate) {
        this.smsg(core, message);
        await cmd(core, message, chatUpdate, this.store);
    }

    smsg(core, message) {
        if (message.message?.conversation) {
            const msg = message.message.conversation;
            logInfo(`Received message: ${msg}`);
        } else if (message.message?.imageMessage) {
            logInfo(`Received an image from ${message.key.remoteJid}`);
        } else if (message.message?.videoMessage) {
            logInfo(`Received a video from ${message.key.remoteJid}`);
        } else if (message.message?.audioMessage) {
            logInfo(`Received an audio message from ${message.key.remoteJid}`);
        }
    }
}

(async () => {
    const bot = new WhatsAppBot();
    await bot.initialize();
})();