const { contextBridge, ipcRenderer } = require('electron');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: { ...ipcRenderer },
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
    cryptr: cryptr
});