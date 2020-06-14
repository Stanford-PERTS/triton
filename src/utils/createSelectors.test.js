import createSelectors from './createSelectors';

describe('createSelectors', () => {
  it('throws if stateSliceSelector parameter is not of type function', () => {
    expect(() => createSelectors('', {})).toThrow();
  });

  it('throws if selectors parameter is not of type object', () => {
    expect(() => createSelectors(x => x, '')).toThrow();
  });

  it('makes selectors that reference some nestedState', () => {
    const sliceSelector = state => state.stateSlice;
    const state = {
      stateSlice: {
        some: '',
        nested: '',
        state: '',
      },
    };
    const mockSelector = jest.fn();
    // Mock selectors
    const mockSelectors = {
      mockSelector,
    };
    // Make new selectors that reference nested state
    const boundSelectors = createSelectors(sliceSelector, mockSelectors);

    // Call nested selector with state
    boundSelectors.mockSelector(state);

    // Expect first argument to mockSelector to be nested part of state
    const expectedArg = state.stateSlice;
    const [[actualArg]] = mockSelector.mock.calls;

    expect(actualArg).toEqual(expectedArg);
  });
});
