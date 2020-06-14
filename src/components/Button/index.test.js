import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import Button from './';

describe('Button component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    const text = 'Save Progress';
    ReactDOM.render(<Button>{text}</Button>, div);
  });

  it('displays text on the button', () => {
    const div = document.createElement('div');
    const text = 'Save Progress';
    const wrapper = mount(<Button>{text}</Button>, div);
    expect(wrapper.text()).toEqual(text);
  });

  it('displays loading text on the button when loading', () => {
    const div = document.createElement('div');
    const text = 'Save Progress';
    const loadingText = 'Saving Progress...';
    const wrapper = mount(
      <Button loading loadingText={loadingText}>
        {text}
      </Button>,
      div,
    );
    expect(wrapper.text()).toEqual(loadingText);
  });

  it('displays original text on the button if no loading text provided', () => {
    const div = document.createElement('div');
    const text = 'Save Progress';
    const wrapper = mount(<Button loading>{text}</Button>, div);
    expect(wrapper.text()).toEqual(text);
  });

  it('is disabled when loading', () => {
    const div = document.createElement('div');
    const text = 'Save Progress';
    const wrapper = mount(<Button loading>{text}</Button>, div);
    expect(wrapper.html()).toContain('disabled');
    // Just looking to see if HTML string contains disabled since there's a
    // quirk where the button is disabled, but since we are technically passing
    // disabled=false to the component, then checking
    //   expect(wrapper.prop('disabled')).toEqual(true)
    // turns out to be false.
  });

  it('is disabled when disabled', () => {
    const div = document.createElement('div');
    const text = 'Save Progress';
    const wrapper = mount(<Button disabled>{text}</Button>, div);
    expect(wrapper.prop('disabled')).toEqual(true);
  });
});
