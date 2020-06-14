import createFormSelectors from './createFormSelectors';

describe('createFormSelectors', () => {
  it('returns an object of redux form selectors given a form name', () => {
    const form = 'name';

    const expected = {
      [`getNameFormValues`]: expect.any(Function),
      [`getNameFormInitialValues`]: expect.any(Function),
      [`getNameFormSyncErrors`]: expect.any(Function),
      [`getNameFormMeta`]: expect.any(Function),
      [`getNameFormAsyncErrors`]: expect.any(Function),
      [`getNameFormSyncWarnings`]: expect.any(Function),
      [`getNameFormSubmitErrors`]: expect.any(Function),
      [`getNameFormValue`]: expect.any(Function),
      [`isNameFormDirty`]: expect.any(Function),
      [`isNameFormPristine`]: expect.any(Function),
      [`isNameFormValid`]: expect.any(Function),
      [`isNameFormInvalid`]: expect.any(Function),
      [`isNameFormSubmitting`]: expect.any(Function),
      [`hasNameFormSubmitSucceeded`]: expect.any(Function),
      [`hasNameFormSubmitFailed`]: expect.any(Function),
    };
    const actual = createFormSelectors(form);

    expect(actual).toMatchObject(expected);
  });

  it('maintains camelCase for passed form name', () => {
    const form = 'testName';

    const expected = {
      [`getTestNameFormValues`]: expect.any(Function),
      [`getTestNameFormInitialValues`]: expect.any(Function),
      [`getTestNameFormSyncErrors`]: expect.any(Function),
      [`getTestNameFormMeta`]: expect.any(Function),
      [`getTestNameFormAsyncErrors`]: expect.any(Function),
      [`getTestNameFormSyncWarnings`]: expect.any(Function),
      [`getTestNameFormSubmitErrors`]: expect.any(Function),
      [`getTestNameFormValue`]: expect.any(Function),
      [`isTestNameFormDirty`]: expect.any(Function),
      [`isTestNameFormPristine`]: expect.any(Function),
      [`isTestNameFormValid`]: expect.any(Function),
      [`isTestNameFormInvalid`]: expect.any(Function),
      [`isTestNameFormSubmitting`]: expect.any(Function),
      [`hasTestNameFormSubmitSucceeded`]: expect.any(Function),
      [`hasTestNameFormSubmitFailed`]: expect.any(Function),
    };
    const actual = createFormSelectors(form);

    expect(actual).toMatchObject(expected);
  });
});
