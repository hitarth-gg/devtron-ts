const { spawnSync } = require('node:child_process');
const path = require('node:path');
const electronPath = require('electron');
require('colors')

const pass = '[PASS]'.green
const fail = '[FAIL]'.red

async function main() {
  const runnerArgs = ['spec'];
  console.log(`Running Electron with args: ${path.resolve(__dirname, '..', '..')}`);
  
  const { status, signal } = spawnSync(electronPath, runnerArgs, {
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
