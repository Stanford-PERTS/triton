import React from 'react';
import { mount } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import { testSelector } from 'utils/testingUtils';

import FormButton from '.';

// https://github.com/typicode/react-fake-props#usage
// react-fake-props requires the component path to be passed, instead of the
// component itself, to be able to support Flow and PropTypes.
// To include optional props, pass { optional: true }
const componentPath = path.join(__dirname, './index.js');
const defaultProps = {
  ...fakeProps(componentPath, { optional: true }),
  ...FormButton.defaultProps,
};

function clickButton(wrapper, attr) {
  const button = wrapper.find(testSelector(attr));

  // Unsolved problem: wrapper.find() may return duplicate nodes. Usually you
  // are selecting for a unique one so we can just choose the first.
  // N.B. Simluating the click updates the wrapper, which is necessary in
  // enzyme 3.x, see https://airbnb.io/enzyme/docs/guides/migration-from-2-to-3.html
  // N.B. Just like a real click, simulating a click on a disabled button
  // doesn't do anything.
  button.first().simulate('click');
}

function testDisabled(wrapper, attr, isDisabled) {
  const initialButton = wrapper.find(testSelector(attr));
  expect(initialButton.hostNodes().props().disabled).toBe(isDisabled);
}

function baseProps() {
  return {
    ...defaultProps,
    handleSubmit: jest.fn(),
    children: <span>initial button text</span>,
  };
}

function baseConfirmProps() {
  return {
    ...baseProps(),
    confirmationPrompt: <span>prompt</span>,
    confirmationButtonText: <span>button text</span>,
  };
}

describe('FormButton with confirmation', () => {
  it('should warn before submitting', () => {
    const props = baseConfirmProps();
    const wrapper = mount(<FormButton {...props} />);

    clickButton(wrapper, 'form-button-initial');

    const confirm = wrapper.find(testSelector('form-button-confirmation'));
    expect(confirm.hostNodes().length).toBe(1);
  });

  it('disables initial button when not submittable', () => {
    const props = baseConfirmProps();
    props.submittable = false;
    const wrapper = mount(<FormButton {...props} />);
    testDisabled(wrapper, 'form-button-initial', true);
  });

  it('disables initial button when not allowed', () => {
    const props = baseConfirmProps();
    props.maySubmit = false;
    const wrapper = mount(<FormButton {...props} />);
    testDisabled(wrapper, 'form-button-initial', true);
  });

  it('disables initial button when submitting', () => {
    const props = baseConfirmProps();
    props.submitting = true;
    const wrapper = mount(<FormButton {...props} />);
    testDisabled(wrapper, 'form-button-initial', true);
  });

  it('disables the confirm button when not submittable', () => {
    const props = baseConfirmProps();
    props.submittable = false;
    const wrapper = mount(<FormButton {...props} />);
    testDisabled(wrapper, 'form-button-initial', true);
  });

  it('disables the confirm button when not allowed', () => {
    const props = baseConfirmProps();
    props.maySubmit = false;
    const wrapper = mount(<FormButton {...props} />);
    testDisabled(wrapper, 'form-button-initial', true);
  });

  it('disables the confirm button when submitting', () => {
    const props = baseConfirmProps();
    const wrapper = mount(<FormButton {...props} />);
    clickButton(wrapper, 'form-button-initial');
    wrapper.setProps({ submitting: true });
    testDisabled(wrapper, 'form-button-confirmation', true);
  });

  it('calls handleSubmit', () => {
    const props = baseConfirmProps();
    const wrapper = mount(<FormButton {...props} />);
    clickButton(wrapper, 'form-button-initial');
    clickButton(wrapper, 'form-button-confirmation');
    expect(props.handleSubmit).toHaveBeenCalled();
  });

  it('closes confirmation after submitting', () => {
    const props = baseConfirmProps();
    const wrapper = mount(<FormButton {...props} />);
    clickButton(wrapper, 'form-button-initial');
    clickButton(wrapper, 'form-button-confirmation');
    expect(
      wrapper.find(testSelector('form-button-initial')).hostNodes().length,
    ).toBe(1);
    expect(
      wrapper.find(testSelector('form-button-confirmation')).hostNodes().length,
    ).toBe(0);
  });
});
