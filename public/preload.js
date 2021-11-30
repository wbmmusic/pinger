const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", { ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on, removeAllListeners: ipcRenderer.removeAllListeners } });