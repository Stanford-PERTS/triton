import validate, {
  VALIDATE_PASSWORD_REQUIRED,
  VALIDATE_PASSWORD_MUST_MATCH,
} from './validate';

describe('SignUpForm validate', () => {
  const props = {};

  it('should not flag a good password', () => {
    const values = {
      password: 'passwordEntered',
      passwordConfirm: 'passwordEntered',
    };
    const errors = { password: null, passwordConfirm: null };
    expect(validate(values, props)).toEqual(errors);
  });

  it('should flag no password', () => {
    const values = {
      password: '',
      passwordConfirm: '',
    };
    const errors = {
      password: VALIDATE_PASSWORD_REQUIRED,
      passwordConfirm: null,
    };
    expect(validate(values, props)).toEqual(errors);
  });

  it('should flag mismatched passwords', () => {
    const values = {
      password: 'passwordEntered',
      passwordConfirm: '',
    };
    const errors = {
      password: null,
      passwordConfirm: VALIDATE_PASSWORD_MUST_MATCH,
    };
    expect(validate(values, props)).toEqual(errors);
  });

  it('preserves sync errors', () => {
    const propsWithError = {
      formSyncErrors: {
        _form: 'some existing error',
      },
    };
    const values = {
      password: 'passwordEntered',
      passwordConfirm: '',
    };
    const errors = {
      ...propsWithError.formSyncErrors,
      password: null,
      passwordConfirm: VALIDATE_PASSWORD_MUST_MATCH,
    };
    expect(validate(values, propsWithError)).toEqual(errors);
  });
});
