// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('node:path');
// const { pathToFileURL } = require('node:url');
// const Mocha = require('mocha');
// const { getSpecFiles } = require('./script/spec-helper');
// const fs = require('node:fs').promises;
// require('colors');

// // process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../tsconfig.json');
// const pass = '[PASS]'.green;
// const fail = '[FAIL]'.red;

// function createWindow() {
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       sandbox: false, // disable sandbox for testing
//     },
//   });
//   // mainWindow.webContents.openDevTools();

//   mainWindow.loadURL(pathToFileURL(path.join(__dirname, 'index.html')).toString());
// }

// app.whenReady().then(async () => {
//   require('ts-node').register({
//     compilerOptions: {
//       module: 'commonjs',
//     },
//   });

//   ipcMain.on('test-result', (event, { type, payload }) => {
//     if (type === 'fail') {
//       console.error(`${fail} ${payload.title}`);
//       console.log(payload.error);
//     } else if (type === 'pass') {
//       console.log(`${pass} ${payload.title} (${payload.duration}ms)`);
//     } else if (type === 'done') {
//       if (payload.failures > 0)
//         console.log(`${fail} Test suite finished. Failures: ${payload.failures}`);
//     } else if (type === 'error') {
//       console.error('Fatal test error:', payload);
//     }
//   });

//   const mocha = new Mocha({
//     timeout: 10000,
//     ui: 'bdd',
//     color: true,
//   });

//   // const testFiles = await getSpecFiles();
//   const testFiles = [path.join(__dirname, 'devtron-install-spec.ts')];

//   if (testFiles.length === 0) {
//     console.error('No test files found.');
//     return;
//   }

//   testFiles.sort().forEach((file) => {
//     mocha.addFile(file);
//   });

//   mocha.run((failures) => {
//     console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBB');

//     console.log(failures);

//     if (failures > 0) {
//       console.error(`${fail} ${failures} test(s) failed.`);
//       process.exitCode = 1;
//     } else {
//       console.log(`${pass} All tests passed.`);
//     }

//     // app.quit();
//   });

//   createWindow();
// });
/* ------------------------------------------------------ */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const Mocha = require('mocha');
require('colors');

const pass = '[PASS]'.green;
const fail = '[FAIL]'.red;

// Track test completion and failures
let rendererTestDone = false;
let mainTestDone = false;
let mainFailures = 0;
let rendererFailures = 0;

/**
 * Exit the app after both test suites complete
 */
function maybeExit() {
  if (mainTestDone && rendererTestDone) {
    const totalFailures = mainFailures + rendererFailures;

    console.log('\n/* ==================== TEST SUMMARY ==================== */'.cyan);
    if (mainFailures || rendererFailures) {
      console.log(`Main process failures: ${mainFailures}`);
      console.log(`Renderer process failures: ${rendererFailures}`);
      console.log(`${fail} Test suite finished with ${totalFailures} failure(s).`);
    } else {
      console.log(`${pass} All tests passed.`);
    }

    app.exit(totalFailures > 0 ? 1 : 0);
  }
}

/**
 * Create test browser window
 */
function createTestWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  // mainWindow.webContents.openDevTools();

  mainWindow.loadURL(pathToFileURL(path.join(__dirname, 'index.html')).toString());
}

/**
 * Setup IPC listener for renderer test results
 */
function setupIPCHandlers() {
  ipcMain.on('test-result', (event, { type, payload }) => {
    if (type === 'fail') {
      console.error(`${fail} ${payload.title}`);
      console.error(payload.error);
    } else if (type === 'pass') {
      // console.log(`${pass} ${payload.title} (${payload.duration}ms)`);
    } else if (type === 'done') {
      rendererFailures = payload.failures;
      rendererTestDone = true;
      if (payload.failures > 0) {
        console.log(`${fail} Renderer tests failed. Failures: ${payload.failures}`);
      } else {
        console.log(`${pass} All renderer tests passed.`);
      }
      maybeExit();
    } else if (type === 'error') {
      console.error('Fatal test error in renderer:', payload);
      rendererFailures = 1;
      rendererTestDone = true;
      maybeExit();
    }
  });
}

/**
 * Run Mocha tests in the main process
 */
async function runMainProcessTests() {
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

  // Add your test files here
  const testFiles = [path.join(__dirname, 'devtron-install-spec.ts')];

  if (testFiles.length === 0) {
    console.error('No test files found.');
    mainTestDone = true;
    maybeExit();
    return;
  }

  testFiles.sort().forEach((file) => {
    mocha.addFile(file);
  });

  mocha.run((failures) => {
    mainFailures = failures;
    if (failures > 0) {
      console.error(`${fail} ${failures} main process test(s) failed.`);
    } else {
      console.log(`${pass} All main process tests passed.`);
    }

    mainTestDone = true;
    maybeExit();
  });
}

/**
 * App entry point
 */
app.whenReady().then(async () => {
  setupIPCHandlers();
  createTestWindow();
  await runMainProcessTests();
});
