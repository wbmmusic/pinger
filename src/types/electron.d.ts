export interface Device {
    id: string;
    name: string;
    address: string;
    notes: string;
    frequency: number;
    trys: number;
    status?: string;
    lastChecked?: string | null;
    lastGood?: string | null;
}

export interface EmailSettings {
    addresses: string[];
    subject: string;
    location?: string;
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
