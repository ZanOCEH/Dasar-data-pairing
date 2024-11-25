/*
 • Fitur By Anomaki Team
 • Created : Nazand Code
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
*/

import chalk from 'chalk';

export const logInfo = (message) => {
    console.log(chalk.blue(`[INFO] ${message}`));
};

export const logSuccess = (message) => {
    console.log(chalk.green(`[SUCCESS] ${message}`));
};

export const logError = (message) => {
    console.log(chalk.red(`[ERROR] ${message}`));
};

export const logWarning = (message) => {
    console.log(chalk.yellow(`[WARNING] ${message}`));
};

export const logPairingCode = (code) => {
    console.log(chalk.magenta(`Your Pairing Code: ${code}`));
};

export const logConnectionStatus = (status) => {
    if (status === 'connecting') {
        console.log(chalk.yellow(`[STATUS] Connecting...`));
    } else if (status === 'open') {
        console.log(chalk.green(`[STATUS] Connection Open`));
    } else if (status === 'close') {
        console.log(chalk.red(`[STATUS] Connection Closed`));
    }
};