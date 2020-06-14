import validate, {
  VALIDATE_LOGIN_EMAIL_REQUIRED,
  VALIDATE_LOGIN_PASSWORD_REQUIRED,
  VALIDATE_LOGIN_EMAIL_INVALID,
} from './validate';

describe('LoginForm validate', () => {
  it('should not flag good email and password', () => {
    const values = { email: 'test@example.com', password: 'passwordEntered' };
    const errors = { email: null, password: null };
    expect(validate(values)).toEqual(errors);
  });

  it('should flag missing email address', () => {
    const values = { email: null, password: 'passwordEntered' };
    const errors = { email: VALIDATE_LOGIN_EMAIL_REQUIRED, password: null };

    expect(validate(values)).toEqual(errors);
  });

  it('should flag missing password', () => {
    const values = { email: 'test@example.com', password: null };
    const errors = { email: null, password: VALIDATE_LOGIN_PASSWORD_REQUIRED };

    expect(validate(values)).toEqual(errors);
  });

  it('should flag invalid email addresses', () => {
    const errors = { email: VALIDATE_LOGIN_EMAIL_INVALID, password: null };
    let values;

    values = { email: 'test@.com', password: 'passwordEntered' };
    expect(validate(values)).toEqual(errors);

    values = { email: 'test@', password: 'passwordEntered' };
    expect(validate(values)).toEqual(errors);

    values = { email: 'test123', password: 'passwordEntered' };
    expect(validate(values)).toEqual(errors);
  });
});
