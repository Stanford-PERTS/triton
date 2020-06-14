import * as testingUtils from './testingUtils';

describe('testingUtils', () => {
  it('should return a data-test selector string', () => {
    const expected = '[data-test="name"]';
    const actual = testingUtils.testSelector('name');

    expect(actual).toBe(expected);
  });
});
