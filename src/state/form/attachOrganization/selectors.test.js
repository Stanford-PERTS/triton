import * as selectors from './selectors';
import deepFreeze from 'deep-freeze';

import initialState from './initialState';

describe('attach organization form selectors', () => {
  it('should get submitting flag', () => {
    const submitting = true;
    const state = {
      ...initialState,
      submitting,
    };

    deepFreeze(state);

    const expected = submitting;
    const actual = selectors.attachOrganizationFormSubmitting(state);
    expect(actual).toEqual(expected);
  });

  it('should get teams error', () => {
    const error = { message: 'some error', code: 'error_code' };
    const state = {
      ...initialState,
      error,
    };

    deepFreeze(state);

    const expected = error;
    const actual = selectors.attachOrganizationFormError(state);
    expect(actual).toEqual(expected);
  });

  it('should get attached org id', () => {
    const orgIds = ['Organization_001', 'Organization_002'];
    const state = {
      ...initialState,
      submittedOrganizations: orgIds,
    };

    deepFreeze(state);

    const expected = orgIds;
    const actual = selectors.attachOrganizationFormSubmittedIds(state);
    expect(actual).toEqual(expected);
  });
});
