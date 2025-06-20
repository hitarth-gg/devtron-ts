// import { contextBridge, ipcRenderer } from 'electron';
// console.log('Inside background preload script');

// ipcRenderer.on('devtron-render-event', (event, data) => {
//   console.log(`Received event in preload script: ${data.direction} - ${data.channel}`);
//   contextBridge.executeInMainWorld({
//     func: (data) => {
//       // @ts-ignore
//       logSomeInfo(data);
//     },
//     args: [data.direction],
//   });
// });

/* ------------------------------------------------------ */
import { contextBridge, ipcRenderer } from 'electron';
console.log('Inside background preload script');

ipcRenderer.send('send-to-mai8n', 'Hello from devtron preload script');
ipcRenderer.on('devtron-render-event', (event, data) => {
  console.log(`Received event in preload script: ${data.direction} - ${data.channel}`);

  contextBridge.executeInMainWorld({
    // func: (data) => {
    // logSomeInfo(data.direction);
    // },
    // args: [data.direction],

    func: (data) => {
      // @ts-ignore
      addIpcEvent(data);
    },
    args: [data],
  });
});
