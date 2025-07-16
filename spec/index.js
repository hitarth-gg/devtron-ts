const { app } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const Mocha = require('mocha');

process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../tsconfig.json')

app.whenReady().then(async () => {
  // require('ts-node/register'); // ts-node hook for .ts files
  require("ts-node").register({
    compilerOptions: {
      module: "commonjs",
    },
  });
  
  const mocha = new Mocha({
    timeout: 10000,
    ui: 'bdd',
  });

  // const testFile = path.join(__dirname, '..', 'spec', 'test.ts');
  const testFile = path.join(__dirname, '..', 'spec', 'devtron-install.ts');
  console.log('📄 Test file:', testFile);

  // Register the test file using require
  // require(testFile);
  mocha.addFile(testFile);

  // Now run the tests
  await new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        console.error(`❌ ${failures} test(s) failed`);
        reject(new Error(`${failures} tests failed.`));
      } else {
        console.log('✅ All tests passed!');
        resolve();
      }
    });
  });
});
