import { session } from 'electron';
import { devtron } from '../src/index';
import { expect } from 'chai';

describe('Devtron Installation', () => {
  
  // ensure that ses is created
  console.log(session.defaultSession);
  
  devtron.install();
  
  const ses = session.fromPartition('persist:test-devtron');

  it('should install Devtron', () => {
    console.log(ses.extensions.getAllExtensions());
    
    expect(ses.extensions.getAllExtensions()).to.have.lengthOf(1);
  });
});
