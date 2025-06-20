/* NOT IMPORTING THIS FILE ANYWHERE */


/**
 * This file patches the Electron IPCMain methods to track events
 * and send them to the renderer process.
 * It is required in the main process of the Electron app.
 */

import type { DevtronOptions, Direction, IpcEventData } from '../types/shared';
import { ipcMain, webContents } from 'electron';
import { MSG_TYPE } from '../common/constants';
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
  try {
    console.log('devtron-render-event');
    console.log(serviceWorker);
    console.log(serviceWorker.isDestroyed());
    serviceWorker.send('devtron-render-event', eventData);
  } catch (error) {
    console.error('Failed to send IPC event to service worker:', error);
  }
}

export async function monitorMain(options: DevtronOptions, devtron: Electron.Extension) {
  const { session } = options;

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
  // serviceWorker.send('devtron-render-event', 'Hello');

  // prettier-ignore
  // @ts-expect-error: '-ipc-message' is an internal event
  session.on( '-ipc-message', (event: Electron.IpcMainEvent | Electron.IpcMainServiceWorkerEvent, channel: string, args: any[] ) => {
    console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
    const output = {
      channel,
      args,
      event
    }
    console.log(`[DEVTRON MAIN SESSION] async message`, {event: event.type ,channel, args })
    if (event.type === 'service-worker')
    {

      trackIpcEvent('service-worker-to-main', channel, args, serviceWorker);
    }
    else if (event.type === 'frame')
      trackIpcEvent('renderer-to-main', channel, args, serviceWorker);
  });

  // prettier-ignore
  // @ts-expect-error: '-ipc-invoke' is an internal event
  session.on( '-ipc-invoke', ( event: | Electron.IpcMainInvokeEvent | Electron.IpcMainServiceWorkerInvokeEvent, channel: string, args: any[]) => {
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
}
