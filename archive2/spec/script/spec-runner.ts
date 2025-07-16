import { spawnSync } from 'node:child_process';
import path from 'node:path';
import electronPath from 'electron';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function main(): Promise<void> {
  const runnerArgs: string[] = ['spec'];

  const { status, signal } = spawnSync(electronPath as unknown as string, runnerArgs, {
    cwd: path.resolve(__dirname, '..', '..'),
    stdio: 'inherit',
  });

  if (status !== 0) {
    console.error(`Electron exited with status ${status}, signal: ${signal}`);
    process.exit(status ?? 1);
  }
}

main()
  .then(() => {
    console.log('Electron process completed');
  })
  .catch((error) => {
    console.error('Error running Electron process:', error);
  });
