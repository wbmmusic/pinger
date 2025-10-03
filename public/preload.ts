import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export interface ElectronAPI {
    invoke: (channel: string, data?: any) => Promise<any>;
    send: (channel: string, data?: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    removeListener: (channel: string) => void;
}

contextBridge.exposeInMainWorld("electron", {
    invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data),
    send: (channel: string, data?: any) => ipcRenderer.send(channel, data),
    receive: (channel: string, func: (...args: any[]) => void) => 
        ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: any[]) => func(...args)),
    removeListener: (channel: string) => ipcRenderer.removeAllListeners(channel),
} as ElectronAPI);
