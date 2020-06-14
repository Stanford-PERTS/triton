import validate, {
  VALIDATE_LOGIN_EMAIL_REQUIRED,
  VALIDATE_LOGIN_EMAIL_INVALID,
} from './validate';

describe('SignUpForm validate', () => {
  it('should not flag good email and password', () => {
    const values = { email: 'test@example.com' };
    const errors = { email: null };
    expect(validate(values)).toEqual(errors);
  });

  it('should flag missing email address', () => {
    const values = { email: null };
    const errors = { email: VALIDATE_LOGIN_EMAIL_REQUIRED };

    expect(validate(values)).toEqual(errors);
  });

  it('should flag invalid email addresses', () => {
    const errors = { email: VALIDATE_LOGIN_EMAIL_INVALID };
    let values;

    values = { email: 'test@.com', password: 'passwordEntered' };
    expect(validate(values)).toEqual(errors);

    values = { email: 'test@', password: 'passwordEntered' };
    expect(validate(values)).toEqual(errors);

    values = { email: 'test123', password: 'passwordEntered' };
    expect(validate(values)).toEqual(errors);
  });
});
