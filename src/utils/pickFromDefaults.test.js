import pickFromDefaults from './pickFromDefaults';
import deepFreeze from 'deep-freeze';

describe('pickFromDefaults', () => {
  it('returns a new object with no side effects', () => {
    const defaults = {
      a: 'a',
      b: 'b',
    };
    const object = {
      a: 'A',
      b: 'B',
    };

    // Check for side effects
    deepFreeze(defaults);
    deepFreeze(object);

    const expected = {
      a: 'A',
      b: 'B',
    };
    const actual = pickFromDefaults(defaults, object);

    expect(actual).toEqual(expected);
  });

  it('returns an object with only key/value pairs from defaults', () => {
    const defaults = {
      a: 'a',
      b: 'b',
    };
    const object = {
      a: 'A',
      b: 'B',
      c: 'C',
      d: 'D',
    };

    const expected = {
      a: 'A',
      b: 'B',
    };
    const actual = pickFromDefaults(defaults, object);

    expect(actual).toEqual(expected);
  });

  it('should use default values if object has null/undefined values', () => {
    const defaults = {
      a: 'a',
      b: 'b',
      c: 'c',
    };
    const object = {
      a: null,
      b: undefined,
      c: 'C',
    };

    const expected = {
      a: 'a',
      b: 'b',
      c: 'C',
    };
    const actual = pickFromDefaults(defaults, object);

    expect(actual).toEqual(expected);
  });
});
