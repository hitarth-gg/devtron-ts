import { contextBridge, ipcRenderer } from 'electron';
console.log('Preload script for Devtron is running');
ipcRenderer.removeAllListeners('devtron-render-event');

ipcRenderer.on('devtron-render-event', (event, data) => {
  console.log(`Received event in preload script: ${data.direction} - ${data.channel}`);
  contextBridge.executeInMainWorld({
    func: (data) => {
      // @ts-expect-error: `addIpcEvent` is a function defined in background service worker
      addIpcEvent(data);
    },
    args: [data],
  });
});
