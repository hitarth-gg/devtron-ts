const { app } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const Mocha = require('mocha');
const fs = require('node:fs').promises;
require('colors')

// process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../tsconfig.json');
const pass = '[PASS]'.green
const fail = '[FAIL]'.red

async function getSpecFiles() {
  const filter = (file) => file.endsWith('-spec.ts');
  try {
    const files = await fs.readdir(__dirname);
    const testFiles = files.filter(filter).map((file) => path.join(__dirname, file));
    return testFiles;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

app.whenReady().then(async () => {
  require('ts-node').register({
    compilerOptions: {
      module: 'commonjs',
    },
  });

  const mocha = new Mocha({
    timeout: 10000,
    ui: 'bdd',
    color: true,
  });

  const testFiles = await getSpecFiles();

  if (testFiles.length === 0) {
    console.error('No test files found.');
    return;
  }

  testFiles.sort().forEach((file) => {
    mocha.addFile(file);
  });

  mocha.run((failures) => {
    if (failures > 0) {
      console.error(`${fail} ${failures} test(s) failed.`);
      process.exitCode = 1;
    } else {
      console.log(`${pass} All tests passed.`);
    }

    app.quit();
  });
});
