import { app } from 'electron';
import type { Direction, IpcEventData } from './types/shared';
import path from 'node:path';

// prettier-ignore
function trackIpcEvent(direction: Direction, channel: string, args: any[], serviceWorker: Electron.ServiceWorkerMain) {
  console.log('[TRACK IPC CALLED]', { direction, channel });

  const eventData: IpcEventData = {
    direction,
    channel,
    args,
    timestamp: Date.now(),
  };

  if (serviceWorker === null) {
    console.error('Service worker for devtron is not registered yet. Cannot track IPC event.');
    return;
  }
  serviceWorker.send('devtron-render-event', eventData);
}

function registerIpcListeners(ses: Electron.Session, serviceWorker: Electron.ServiceWorkerMain) {
  console.log(`[DEVTRON MAIN SESSION] Registering IPC listeners for session`);

  /* ------------------------------------------------------ */
  // prettier-ignore
  // @ts-expect-error: '-ipc-message' is an internal event
  ses.on( '-ipc-message', (event: Electron.IpcMainEvent | Electron.IpcMainServiceWorkerEvent, channel: string, args: any[] ) => {
        if(event.type === 'frame')
        trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
      else if(event.type === 'service-worker')
        trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
      console.log(`[DEVTRON MAIN SESSION] async message`, {event: event.type ,channel })
    });

  // prettier-ignore
  // @ts-expect-error: '-ipc-invoke' is an internal event
  ses.on( '-ipc-invoke', ( event: | Electron.IpcMainInvokeEvent | Electron.IpcMainServiceWorkerInvokeEvent, channel: string, args: any[]) => {
        if(event.type === 'frame')
        trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
      else if(event.type === 'service-worker')
        trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
        console.log(`[DEVTRON MAIN SESSION] invoke message`, {event: event.type ,channel })
    });
  // prettier-ignore
  // @ts-expect-error: '-ipc-message-sync' is an internal event
  ses.on('-ipc-message-sync', (event: Electron.IpcMainEvent | Electron.IpcMainServiceWorkerEvent, channel: string, args: any[]) => {
        if(event.type === 'frame')
        trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
      else if(event.type === 'service-worker')
        trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
        console.log(`[DEVTRON MAIN SESSION] sync message`, { event: event.type, channel });
    });
  /* ------------------------------------------------------ */
}

async function startServiceWorker(ses: Electron.Session, extension: Electron.Extension) {
  try {
    const sw = await ses.serviceWorkers.startWorkerForScope(extension.url); // gives an error: [Error: Failed to start service worker.]
    sw.startTask();
    registerIpcListeners(ses, sw);
  } catch (error_1) {
    console.log(`Failed to start Devtron service worker ${error_1}, trying again...`);
    try {
      const handleDetails = async (
        details: Electron.ServiceWorkersRunningStatusChangedEventParams
      ) => {
        const sw = ses.serviceWorkers.getWorkerFromVersionID(details.versionId);
        if (sw?.scope === extension.url) {
          sw.startTask();
          console.log(`Devtron service-worker started`);
          registerIpcListeners(ses, sw);
          ses.serviceWorkers.removeListener('running-status-changed', handleDetails);
        }
      };
      ses.serviceWorkers.on('running-status-changed', handleDetails);
    } catch (error_2) {
      console.error('Failed to start Devtron service worker:', error_2);
    }
  }
}

function install() {
  app.on('session-created', async (ses) => {
    let devtron: Electron.Extension;
    try {
      /* ------------------------------------------------------ */
      // @ts-expect-error: __MODULE_TYPE__ is defined in webpack config, value is either 'esm' or 'cjs'
      const moduleFolder = __MODULE_TYPE__;
      const preloadFileName = `preload.${moduleFolder}`;
      const str = ses.registerPreloadScript({
        filePath: path.resolve(
          'node_modules',
          '@electron',
          'devtron',
          'dist',
          moduleFolder,
          preloadFileName
        ),
        type: 'service-worker',
      });
      console.log('Devtron: Preload script registered', str);
      /* ------------------------------------------------------ */

      devtron = await ses.extensions.loadExtension(
        path.resolve('node_modules', '@electron', 'devtron', 'dist', 'extension'),
        { allowFileAccess: true }
      );
      startServiceWorker(ses, devtron);
      console.log('Devtron: extension loaded successfully:', devtron.id);
    } catch (error) {
      console.error('Failed to load Devtron extension:', error);
    }
  });
}

export const devtron = {
  install,
};
