import { ipcMain } from 'electron';
import * as nodemailer from 'nodemailer';
import * as mainModule from './main';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { EmailTemplate } from '../src/EmailTemplate_mobile';

interface SMTPConfig {
    provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
}

interface EmailSettings {
    addresses: string[];
    subject: string;
    location?: string;
    smtp?: SMTPConfig;
    testEmail?: string;
}

const createTransporter = (smtp: SMTPConfig) => {
    return nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: {
            user: smtp.user,
            pass: smtp.pass,
        },
    });
};

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

export const testEmailConnection = async (settings: EmailSettings): Promise<string> => {
    if (!settings.smtp) {
        throw new Error('SMTP configuration not found');
    }
    
    const transporter = createTransporter(settings.smtp);
    
    try {
        await transporter.verify();
        return 'SMTP connection successful';
    } catch (error) {
        throw new Error(`SMTP connection failed: ${error}`);
    }
};

export const sendTestEmail = async (settings: EmailSettings): Promise<string> => {
    if (!settings.smtp) {
        throw new Error('SMTP configuration not found');
    }
    
    if (settings.addresses.length === 0) {
        throw new Error('No recipient addresses configured');
    }
    
    const transporter = createTransporter(settings.smtp);
    
    const message = {
        from: {
            name: 'Pinger Test',
            address: settings.smtp.user,
        },
        to: settings.addresses,
        subject: 'Pinger Test Email',
        text: 'This is a test email from Pinger to verify your email configuration is working correctly.',
        html: '<p>This is a test email from <strong>Pinger</strong> to verify your email configuration is working correctly.</p>'
    };
    
    try {
        const info = await transporter.sendMail(message);
        return `Test email sent successfully: ${info.messageId}`;
    } catch (error) {
        throw new Error(`Failed to send test email: ${error}`);
    }
};

export const generatePreviewHtml = (type: 'device-down' | 'device-recovery' | 'escalation', location: string) => {
    const sampleDevices = [{
        id: 'test-1',
        name: 'Test Router',
        address: '192.168.1.1',
        status: type === 'device-recovery' ? 'ALIVE' : 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '12/18/2025 08:30:15 AM'
    }];
    
    const allAffectedDevices = [{
        id: 'main-router',
        name: 'Main Router',
        address: '192.168.1.1',
        status: 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '08:30 AM'
    }, {
        id: 'server-01',
        name: 'Server-01',
        address: '192.168.1.100',
        status: 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '08:28 AM'
    }, {
        id: 'switch-a',
        name: 'Switch-A',
        address: '192.168.1.10',
        status: 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '08:25 AM'
    }];
    
    return renderToString(
        React.createElement(EmailTemplate, {
            type,
            devices: sampleDevices,
            allAffectedDevices,
            location,
            timestamp: new Date()
        })
    );
};

const generateEmailHtml = (type: 'device-down' | 'device-recovery' | 'escalation', location: string) => {
    const sampleDevices = [{
        id: 'test-1',
        name: 'Test Router',
        address: '192.168.1.1',
        status: type === 'device-recovery' ? 'ALIVE' : 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '12/18/2025 08:30:15 AM'
    }];
    
    const allAffectedDevices = [{
        id: 'main-router',
        name: 'Main Router',
        address: '192.168.1.1',
        status: 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '08:30 AM'
    }, {
        id: 'server-01',
        name: 'Server-01',
        address: '192.168.1.100',
        status: 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '08:28 AM'
    }, {
        id: 'switch-a',
        name: 'Switch-A',
        address: '192.168.1.10',
        status: 'DEAD',
        lastChecked: new Date().toISOString(),
        lastGood: '08:25 AM'
    }];
    
    return renderToString(
        React.createElement(EmailTemplate, {
            type,
            devices: sampleDevices,
            allAffectedDevices,
            location,
            timestamp: new Date()
        })
    );
};

export const sendTemplateTestEmail = async (settings: EmailSettings & { templateType: string }): Promise<string> => {
    if (!settings.smtp) {
        throw new Error('SMTP configuration not found');
    }
    
    if (!settings.testEmail) {
        throw new Error('Test email address not configured');
    }
    
    const transporter = createTransporter(settings.smtp);
    
    const typeConfig: any = {
        'device-down': { title: 'Device Alert - Network Issue Detected', color: '#ff4757', status: '❌ OFFLINE' },
        'device-recovery': { title: 'Device Recovery - Network Restored', color: '#2ed573', status: '✓ ONLINE' },
        'escalation': { title: 'Escalation Alert - Extended Outage', color: '#ffa726', status: '⚠️ EXTENDED OUTAGE' }
    };
    
    const config = typeConfig[settings.templateType] || typeConfig['device-down'];
    
    const html = generatePreviewHtml(settings.templateType as any, settings.location || 'Unknown Location');
    
    const message = {
        from: {
            name: 'Pinger Test',
            address: settings.smtp.user,
        },
        to: [settings.testEmail],
        subject: `${config.title} - Test`,
        text: `This is a test ${settings.templateType} email from Pinger.`,
        html: html
    };
    
    try {
        const info = await transporter.sendMail(message);
        return `Template test email sent successfully: ${info.messageId}`;
    } catch (error) {
        throw new Error(`Failed to send template test email: ${error}`);
    }
};

export const sendEmail = async (send: () => void): Promise<any> => {
    console.log("Sending Email");
    return new Promise(async (resolve, reject) => {
        const eSettings = mainModule.appSettings();
        console.log(eSettings);
        
        if (!eSettings.smtp) {
            reject(new Error('SMTP configuration not found'));
            return;
        }
        
        const transporter = createTransporter(eSettings.smtp);

        const message = {
            from: {
                name: 'Pinger Network Notification',
                address: eSettings.smtp.user,
            },
            to: eSettings.addresses,
            subject: eSettings.subject,
            text: "Network monitoring alert from Pinger",
            html: await getEmailHtml(send)
        };

        transporter.sendMail(message, (err: Error | null, info: any) => {
            if (err) reject(err);
            else resolve(info);
        });
    });
};
