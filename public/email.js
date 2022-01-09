const { ipcMain } = require('electron');
const nodemailer = require('nodemailer');
const idx = require('./main');

const transporter = nodemailer.createTransport({
    host: "mail.wbmtek.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: "notifications@wbmtek.com",
        pass: "this is an email password",
    },
});


transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

exports.getEmailHtml = async (send) => {
    return new Promise((resolve, reject) => {
        ipcMain.once('emailBody', (e, x) => {
            console.log("Received Body")
            //console.log(x)
            resolve(x)
        })
        console.log("===>>> SEND")
        send()
    })
}

exports.sendEmail = async (send) => {
    console.log("Sending Email")
    return new Promise(async (resolve, reject) => {
        const eSettings = idx.emailSettings()
        console.log(eSettings)

        const message = {
            from: {
                name: 'Nubar Ping Notification',
                address: "notifications@wbmtek.com",
            },
            to: eSettings.addresses,
            subject: eSettings.subject,
            text: "Plaintext version of the message",
            html: await this.getEmailHtml(send)
        };

        transporter.sendMail(message, (err, info) => {
            if (err) reject(err)
            else resolve(info)
        })
    })
}

const main = async () => {
    console.log("-->> Senging EMAIL")
    console.log(await this.sendEmail())
}


