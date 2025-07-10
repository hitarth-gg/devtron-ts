import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

async function main() {
  const runnerArgs = ['spec'];

  const exe = await import('electron');
  const { status, signal } = spawnSync(exe.default, runnerArgs, {
    cwd: path.resolve(import.meta.dirname, '..', '..'),
    stdio: 'inherit',
  });
}
main()
  .then(() => {
    console.log('Electron process completed');
  })
  .catch((error) => {
    console.error('Error running Electron process:', error);
  });
