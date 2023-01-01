
require('dotenv').config();

const nodemailer = require('nodemailer');

const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_TO = process.env.SMTP_TO;

if (typeof SMTP_PASSWORD === 'undefined') throw new Error('SMTP_PASSWORD must be defined in env');
if (typeof SMTP_HOST === 'undefined') throw new Error('SMTP_HOST must be defined in env');
if (typeof SMTP_PORT === 'undefined') throw new Error('SMTP_PORT must be defined in env');
if (typeof SMTP_USER === 'undefined') throw new Error('SMTP_USER must be defined in env');
if (typeof SMTP_TO === 'undefined') throw new Error('SMTP_TO must be defined in env');



let configOptions = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
    }
}

let transporter = nodemailer.createTransport(configOptions);


async function emailAdmin (msg) {
    const m = `Clipzip: ${msg}`;
    let message = {
        subject: m,
        text: m,
        from: SMTP_USER,
        to: SMTP_TO,
        envelope: {
            from: SMTP_USER,
            to: SMTP_TO
        }
    };
    const info = await transporter.sendMail(message);
    if (info?.rejected[0]) console.error(info);
}

module.exports = {
    emailAdmin
}

