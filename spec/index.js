import { app } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
app.whenReady().then(async () => {
  await import('ts-node/register');
  await import('ts-node/esm');
  const Mocha = (await import('mocha')).default;

  const mocha = new Mocha({
    timeout: 10000,
    ui: 'bdd',
  });

  const testFile = path.join(import.meta.dirname, '..', 'spec', 'test.ts');
  console.log(testFile);

  mocha.addFile(testFile); // <-- Add your test file
  await import(pathToFileURL(testFile).href);

  await new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        console.error(`❌ ${failures} test(s) failed`);
        reject(new Error(`${failures} tests failed.`));
      } else {
        console.log('✅ All tests passed!');
        resolve(undefined);
      }
    });
  });
});
