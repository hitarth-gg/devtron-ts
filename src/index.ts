import type { Extension } from 'electron';
import { session } from 'electron';
import path from 'node:path';

async function install(): Promise<void> {
  const extensionName = 'devtron';
  const extensions = session.defaultSession.extensions.getAllExtensions();
  const isInstalled = extensions.some(
    (ext: Extension) => ext.name === extensionName
  );

  if (isInstalled) {
    return;
  }

  const devtronPath = path.resolve('node_modules', '@electron', 'devtron');
  const distPath = path.join(devtronPath, 'dist', 'extension');
  try {
    const ext = await session.defaultSession.extensions.loadExtension(
      distPath,
      {
        allowFileAccess: true,
      }
    );
    console.log(`Installed extension: ${ext.name}`);
  } catch (e) {
    console.error('Failed to load devtron: ', e);
  }
}

export const devtron = {
  install,
};
