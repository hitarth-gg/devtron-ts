import { expect } from 'chai';
console.log('Inside test.ts');

describe('Example test', () => {
  it('should run', () => {
    console.log('✅ test case executed');
    expect(2 + 2).to.equal(4);
  });
});
