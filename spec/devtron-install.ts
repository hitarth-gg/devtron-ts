import { session } from 'electron';
import { devtron } from '../src/index';
import { expect } from 'chai';

(globalThis as any).__MODULE_TYPE__ = 'cjs';
describe('Devtron Installation', () => {

  devtron.install();

  const ses = session.fromPartition('persist:test-devtron');
  before(() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000); // wait for 1 second
    });
  });

  it('should install Devtron', () => {
    console.log(ses.extensions.getAllExtensions());

    expect(ses.extensions.getAllExtensions()).to.have.lengthOf(1);
  });
});
