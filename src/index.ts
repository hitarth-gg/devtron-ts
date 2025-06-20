import { app } from 'electron';
import type { Direction, IpcEventData } from './types/shared';
import path from 'node:path';

function trackIpcEvent(direction: Direction, channel: string, args: any[], serviceWorker: any) {
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
async function install(): Promise<void> {
  app.on('session-created', async (session: Electron.Session) => {
    console.log('Installing Devtron...');

    try {
      const devtronPath = path.resolve('node_modules', '@electron', 'devtron');
      const distPath = path.join(devtronPath, 'dist', 'extension');
      const devtron = await session.extensions.loadExtension(distPath, {
        allowFileAccess: true,
      });

      // @ts-expect-error: __MODULE_TYPE__ is defined in webpack config, value is either 'esm' or 'cjs'
      const moduleFolder = __MODULE_TYPE__;
      const preloadFileName = `preload.${moduleFolder}`;

      session.registerPreloadScript({
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

      const serviceWorker = await session.serviceWorkers.startWorkerForScope(devtron.url);
      serviceWorker.startTask();

      // prettier-ignore
      // @ts-expect-error: '-ipc-message' is an internal event
      session.on('-ipc-message', (event: Electron.IpcMainEvent | Electron.IpcMainServiceWorkerEvent, channel: string, args: any[] ) => {
        if (event.type === 'service-worker')
          trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
        else if (event.type === 'frame')
          trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
      });

      // prettier-ignore
      // @ts-expect-error: '-ipc-invoke' is an internal event
      session.on('-ipc-invoke', ( event: | Electron.IpcMainInvokeEvent | Electron.IpcMainServiceWorkerInvokeEvent, channel: string, args: any[]) => {
        if (event.type === 'service-worker')
          trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
        else if (event.type === 'frame')
          trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
      });

      // prettier-ignore
      // @ts-expect-error: '-ipc-message-sync' is an internal event
      session.on('-ipc-message-sync', (event: Electron.IpcMainEvent | Electron.IpcMainServiceWorkerEvent, channel: string, args: any[]) => {
        if (event.type === 'service-worker')
          trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
        else if (event.type === 'frame')
          trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
      });
      /* ------------------------------------------------------ */

      console.log(`Successfully Installed extension: ${devtron.name}`);
    } catch (error) {
      console.error('Failed to load devtron: ', error);
      throw error;
    }
  });
}

export const devtron = {
  install,
};
