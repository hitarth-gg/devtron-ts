import Denque from 'denque';
import { MSG_TYPE, PORT_NAME } from '../../common/constants';
import type {
  IpcEventData,
  IpcEventDataIndexed,
  MessageContentScript,
  MessagePanel,
} from '../../types/shared';

/* ------------------------------------------------------ */
/**
 * This is used to keep the background script alive. More testing is needed to determine whether it is needed or not
 * since other KEEP_ALIVE methods are already implemented in the content script and panel script.
 * Code copied from: https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
 */
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
/* ------------------------------------------------------ */

const MAX_EVENTS = 1000;
const ipcEvents = new Denque<IpcEventDataIndexed>();

const connections: {
  panel: chrome.runtime.Port | null;
  contentScript: chrome.runtime.Port | null;
} = {
  panel: null,
  contentScript: null,
};

function handlePanelMessage(message: MessagePanel): void {
  switch (message.type) {
    case MSG_TYPE.PING:
      connections.panel?.postMessage({ type: MSG_TYPE.PONG }); // (mimics `port.postMessage(...)`)
      break;
    case MSG_TYPE.KEEP_ALIVE:
      break;
    case MSG_TYPE.GET_ALL_EVENTS:
      for (let i = 0; i < ipcEvents.length; i++) {
        const event = ipcEvents.get(i);
        connections.panel?.postMessage({ type: MSG_TYPE.RENDER_EVENT, event });
      }
      break;
    case MSG_TYPE.CLEAR_EVENTS:
      ipcEvents.clear();
      break;
    default:
      throw new Error(
        `Devtron - Background script: Unknown message type from panel: ${
          (message as MessagePanel).type
        }`
      );
  }
}

function addIpcEvent(event: IpcEventData): void {
  const last = ipcEvents.get(ipcEvents.length - 1);
  const newEvent: IpcEventDataIndexed = {
    serialNumber: (last?.serialNumber ?? 0) + 1,
    ...event,
  };
  ipcEvents.push(newEvent);
  /* Remove the oldest event if the length exceeds MAX_EVENTS */
  if (ipcEvents.length > MAX_EVENTS) ipcEvents.shift();
  if (connections.panel) {
    connections.panel.postMessage({
      type: MSG_TYPE.RENDER_EVENT,
      event: newEvent,
    });
  }
}

function handleContentMessage(message: MessageContentScript): void {
  switch (message.type) {
    case MSG_TYPE.ADD_IPC_EVENT:
      addIpcEvent(message.event);
      break;
    case MSG_TYPE.KEEP_ALIVE:
      break;
  }
}

/**
 *  chrome.runtime.onConnect: Fired when a connection is made from either an extension process or a content script.
 *  This is used to listen for connections from the devtools panel and content scripts.
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === PORT_NAME.PANEL) {
    connections.panel = port;
    port.onMessage.addListener((message: MessagePanel) =>
      handlePanelMessage(message)
    );
    port.onDisconnect.addListener(() => {
      console.warn('Devtron - Background script: Panel disconnected'); // #EDIT: Add better logging
      connections.panel = null;
    });
  } else if (port.name === PORT_NAME.CONTENT_SCRIPT) {
    connections.contentScript = port;
    port.onMessage.addListener((message: MessageContentScript) =>
      handleContentMessage(message)
    );
    port.onDisconnect.addListener(() => {
      console.log('Devtron - Background script: Content script disconnected'); // #EDIT: Add better logging
      connections.contentScript = null;
    });
  }
});
