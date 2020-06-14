// Field-level validation functions for redux-form Fields.
// https://redux-form.com/8.1.0/examples/fieldlevelvalidation/
import { default as validatorIsEmail } from 'validator/lib/isEmail';

// <Field
//   name="signature"
//   component={TextField}
//   label="Type your name to sign"
//   validate={[required]}
// />
export const required = value =>
  value || typeof value === 'number' ? undefined : 'This is a required field.';

// <Field
//   name="email"
//   component={TextField}
//   label="Email address"
//   validate={[isEmail]}
// />
export const isEmail = value =>
  validatorIsEmail(value) ? undefined : 'A valid email address is required.';

// const minLength1 = minLength(1);
// const maxLength2 = maxLength(2);
//
// <Field
//   name="state"
//   component={TextField}
//   label="State"
//   placeholder="Enter your 2 character state abbreviation"
//   validate={[minLength1, maxLength2]}
// />
export const maxLength = max => value =>
  value && value.length >= max
    ? `Your response must be ${max} characters or less.`
    : undefined;

export const minLength = min => value =>
  value && value.length < min
    ? `Your response must be ${min} characters or more.`
    : undefined;

// Default field length is 10,000 characters so that we don't overfill the
// response.body field in the database.
// <Field
//   name="ep_feedback_improve"
//   component={TextField}
//   label="How can we improve the Engagement Project for next year?"
//   validate={[maxLengthGlobal]}
// />
export const maxLengthGlobal = maxLength(10000);

// Limit checkbox selections to two options.
// <Field
//   name="why-do-you-teach"
//   component={SelectMultipleField}
//   label="Please select two"
//   data-test="select-multiple"
//   validate={[selectTwo]}
//   options={[...]}
// />
//
// We store our checkbox selections as an array of the values selected so we
// can just use value.length to determine how many options have been selected.
export const SELECT_TWO_ERROR = 'Please select two choices.';
export const selectTwo = value =>
  value && value.length === 2 ? null : SELECT_TWO_ERROR;

export const SELECT_MAX_TWO_ERROR = 'Please select no more than two choices.';
export const selectMaxTwo = (value = []) =>
  value && value.length <= 2 ? null : SELECT_MAX_TWO_ERROR;
