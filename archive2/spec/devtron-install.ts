import { session } from 'electron';
import { devtron } from '../src/index';
import { expect } from 'chai';

describe('Devtron Installation', () => {
  const ses = session.fromPartition('persist:test-devtron');

  // ensure that ses is created
  if (!ses) throw new Error('Session not created');
  devtron.install();

  it('should install Devtron', () => {
    expect(ses.extensions.getExtension('devtron')).to.exist;
  });
});
