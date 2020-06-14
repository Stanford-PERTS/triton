import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import { testSelector } from 'utils/testingUtils';

import InfoBox from 'components/InfoBox';
import AttachOrganizationForm from './AttachOrganizationForm';

// https://github.com/typicode/react-fake-props#usage
// react-fake-props requires the component path to be passed, instead of the
// component itself, to be able to support Flow and PropTypes.
// To include optional props, pass { optional: true }
const componentPath = path.join(__dirname, './AttachOrganizationForm.js');
const defaultProps = fakeProps(componentPath, { optional: true });

jest.mock('redux-form/lib/Field', () => 'field');

describe('AttachOrganization component', () => {
  it('should call onSubmit upon form submit', () => {
    const onSubmit = jest.fn();
    const props = {
      ...defaultProps,
      // mock reduxForm handleSubmit function
      handleSubmit: f => f(),
      onSubmit,
    };
    const wrapper = shallow(<AttachOrganizationForm {...props} />);
    wrapper.find('form').simulate('submit');

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should not be submittable when pristine', () => {
    const pristine = true;
    const props = {
      ...defaultProps,
      dirty: !pristine,
    };
    const wrapper = shallow(<AttachOrganizationForm {...props} />);
    const submitActions = wrapper.find(testSelector('submit-actions'));

    const expected = pristine;
    const actual = !submitActions.prop('submittable');

    expect(actual).toBe(expected);
  });

  it('should be submittable when dirty, valid, and not submitting', () => {
    const dirty = true;
    const valid = true;
    const attachFormSubmitting = false;
    const props = {
      ...defaultProps,
      dirty,
      valid,
      attachFormSubmitting,
    };
    const wrapper = shallow(<AttachOrganizationForm {...props} />);
    const submitActions = wrapper.find(testSelector('submit-actions'));

    const expected = dirty && valid;
    const actual = submitActions.prop('submittable');

    expect(actual).toBe(expected);
  });

  it('should be submitting when the form data is set', () => {
    const attachFormSubmitting = true;
    const props = {
      ...defaultProps,
      attachFormSubmitting,
    };
    const wrapper = shallow(<AttachOrganizationForm {...props} />);
    const submitActions = wrapper.find(testSelector('submit-actions'));

    const expected = attachFormSubmitting;
    const actual = submitActions.prop('submitting');

    expect(actual).toBe(expected);
  });

  it('should render an InfoBox element if orgs are set', () => {
    const props = {
      ...defaultProps,
      submittedOrganizations: [{ name: 'Foo Org', uid: 'Organization_001' }],
    };
    const wrapper = shallow(<AttachOrganizationForm {...props} />);
    const component = wrapper.find(InfoBox);

    const expected = 1;
    const actual = component.length;

    expect(actual).toBe(expected);
  });
});
