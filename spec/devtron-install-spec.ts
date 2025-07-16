import { session } from 'electron';
import { devtron } from '../src/index';
import { expect } from 'chai';

(globalThis as any).__MODULE_TYPE__ = 'cjs';
describe('Devtron Installation', () => {
  /* --------------- test on defaultSession --------------- */
  if (!session.defaultSession) {
    throw new Error('Default session is not available');
  }

  devtron.install();

  it('should load the extension in defaultSession', () => {
    expect(
      session.defaultSession.extensions
        .getAllExtensions()
        .map((ext) => ext.name)
        .includes('devtron'),
    ).to.be.true;
  });

  it('should register the service worker preload script in defaultSession', () => {
    expect(
      session.defaultSession.getPreloadScripts().some((script) => {
        return script.id === 'devtron-preload' && script.type === 'service-worker';
      }),
    ).to.be.true;
  });

  /* ----------- test on newly created sessions ----------- */
  // const newSes = session.fromPartition('persist:new-session');
  const newSes = session.fromPartition('persist:new-session');

  if (!newSes) {
    throw new Error('New session is not available');
  }

  it('should load the extension in newly created sessions', () => {
    expect(
      newSes.extensions
        .getAllExtensions()
        .map((ext) => ext.name)
        .includes('devtron'),
    ).to.be.true;
  });

  it('should register the service worker preload script in newly created sessions', () => {
    expect(
      session.defaultSession.getPreloadScripts().some((script) => {
        return script.id === 'devtron-preload' && script.type === 'service-worker';
      }),
    ).to.be.true;
  });
});
