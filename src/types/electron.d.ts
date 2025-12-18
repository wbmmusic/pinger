export interface Device {
    id: string;
    name: string;
    address: string;
    notes: string;
    frequency: number;
    trys: number;
    critical?: boolean;
    status?: string;
    lastChecked?: string | null;
    lastGood?: string | null;
}

export interface SMTPConfig {
    provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
}

export interface EmailSettings {
    addresses: string[];
    subject: string;
    location?: string;
    smtp?: SMTPConfig;
    testEmail?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactTitle?: string;
    includeContactInEmails?: boolean;
    muteCloseWarning?: boolean;
}

export interface UpdaterInfo {
    version?: string;
    tag?: string;
    percent?: number;
}

export interface ElectronAPI {
    invoke: (channel: string, data?: any) => Promise<any>;
    send: (channel: string, data?: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    removeListener: (channel: string) => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
