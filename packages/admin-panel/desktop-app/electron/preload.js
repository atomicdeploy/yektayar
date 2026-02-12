const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  onAppConfig: (callback) => ipcRenderer.on('app-config', (event, config) => callback(config)),
  getVersion: () => require('electron').app.getVersion(),
  platform: process.platform
});
