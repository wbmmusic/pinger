const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
    invoke: (a, b) => ipcRenderer.invoke(a, b),
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
});