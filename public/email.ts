import { ipcMain } from 'electron';
import * as nodemailer from 'nodemailer';
import * as mainModule from './main';

const transporter = nodemailer.createTransport({
    host: "mail.wbmtek.com",
    port: 465,
    secure: true,
    auth: {
        user: "notifications@wbmtek.com",
        pass: "this is an email password",
    },
});

transporter.verify(function(error, _success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

export const getEmailHtml = async (send: () => void): Promise<string> => {
    return new Promise((resolve) => {
        ipcMain.once('emailBody', (_e, x: string) => {
            console.log("Received Body");
            resolve(x);
        });
        console.log("===>>> SEND");
        send();
    });
};

export const sendEmail = async (send: () => void): Promise<any> => {
    console.log("Sending Email");
    return new Promise(async (resolve, reject) => {
        const eSettings = mainModule.appSettings();
        console.log(eSettings);

        const message = {
            from: {
                name: 'Nubar Ping Notification',
                address: "notifications@wbmtek.com",
            },
            to: eSettings.addresses,
            subject: eSettings.subject,
            text: "Plaintext version of the message",
            html: await getEmailHtml(send)
        };

        transporter.sendMail(message, (err, info) => {
            if (err) reject(err);
            else resolve(info);
        });
    });
};
