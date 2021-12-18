const { contextBridge, ipcRenderer } = require('electron');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on, removeAllListeners: ipcRenderer.removeAllListeners },
    cryptr: cryptr
});