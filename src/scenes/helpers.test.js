import { fromLocationTo, backToLocation } from './helpers.js';

describe('fromLocationTo helper function', () => {
  it('should return a function when called once', () => {
    expect(fromLocationTo({})).toEqual(expect.any(Function));
  });

  it('should return an object when called twice', () => {
    expect(fromLocationTo({})()).toEqual(expect.any(Object));
  });

  it('save current pathname into state.from', () => {
    const to = '/new/path';
    const currentLocation = {
      pathname: '/current/path',
    };
    const expected = {
      pathname: to,
      state: { from: currentLocation.pathname },
    };
    const actual = fromLocationTo(currentLocation)(to);
    expect(actual).toEqual(expected);
  });
});

describe('backToLocation helper function', () => {
  it('return location object with pathname = state.from', () => {
    const locationWithState = {
      state: {
        from: '/old/path',
      },
    };
    const expected = {
      pathname: locationWithState.state.from,
    };
    const actual = backToLocation(locationWithState);
    expect(actual).toEqual(expected);
  });
});
