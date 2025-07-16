import { app } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Mocha from 'mocha';
import { fileURLToPath } from 'node:url';
const moduleFilename  = fileURLToPath(import.meta.url);
const moduleDirname  = path.dirname(moduleFilename );
app.whenReady().then(async () => {


  await import('ts-node/esm');


  const mocha = new Mocha({
    timeout: 10000,
    ui: 'bdd',
  });

  const testFile = path.join(moduleDirname , '..', 'spec', 'devtron-install.ts');
  console.log('📄 Test file:', testFile);

  mocha.addFile(testFile);

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
