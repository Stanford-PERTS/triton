import * as selectors from './selectors';
import deepFreeze from 'deep-freeze';

import initialState from './initialState';

describe('shared selectors', () => {
  it('should get shared error', () => {
    const state = {
      ...initialState,
      error: { message: 'some error message' },
    };

    const expected = state.error;
    const actual = selectors.sharedError(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get shared loading', () => {
    const state = {
      ...initialState,
      loading: false,
    };

    const expected = state.loading;
    const actual = selectors.sharedLoading(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });

  it('should get shared redirect', () => {
    const state = {
      ...initialState,
      redirect: 'some/path',
    };

    const expected = state.redirect;
    const actual = selectors.sharedRedirect(state);

    deepFreeze(state);
    expect(actual).toEqual(expected);
  });
});
