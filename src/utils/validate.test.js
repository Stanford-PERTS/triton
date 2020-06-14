import {
  selectTwo,
  SELECT_TWO_ERROR,
  selectMaxTwo,
  SELECT_MAX_TWO_ERROR,
} from './validate';

describe('selectTwo validator', () => {
  it('returns correct values', () => {
    const expectedMap = [
      // These shouldn't occur, but they shouldn't break either.
      [null, SELECT_TWO_ERROR],
      [false, SELECT_TWO_ERROR],
      [true, SELECT_TWO_ERROR],
      [0, SELECT_TWO_ERROR],
      [1, SELECT_TWO_ERROR],
      [{}, SELECT_TWO_ERROR],
      // Typical when the form is pristine.
      [undefined, SELECT_TWO_ERROR],
      // Typical when un-checking back to zero.
      [[], SELECT_TWO_ERROR],
      // Incorrect number of values checked.
      [['foo'], SELECT_TWO_ERROR],
      [['foo', 'bar', 'baz'], SELECT_TWO_ERROR],
      // Correct number of values checked.
      [['foo', 'bar'], null], // no error message
    ];

    for (const [value, actual] of expectedMap) {
      expect(selectTwo(value)).toBe(actual);
    }
  });
});

describe('selectMaxTwo validator', () => {
  it('returns correct values', () => {
    const expectedMap = [
      // These shouldn't occur, but they shouldn't break either.
      [null, SELECT_MAX_TWO_ERROR],
      [false, SELECT_MAX_TWO_ERROR],
      [true, SELECT_MAX_TWO_ERROR],
      [0, SELECT_MAX_TWO_ERROR],
      [1, SELECT_MAX_TWO_ERROR],
      [{}, SELECT_MAX_TWO_ERROR],
      // Typical when the form is pristine.
      [undefined, null], // no error message, zero selections is okay
      // Correct number of values checked.
      [[], null],
      [['foo'], null],
      [['foo', 'bar'], null], // no error message
      // Incorrect number of values checked.
      [['foo', 'bar', 'baz'], SELECT_MAX_TWO_ERROR],
    ];

    for (const [value, actual] of expectedMap) {
      expect(selectMaxTwo(value)).toBe(actual);
    }
  });
});
