import React from 'react';
import moment from 'moment/moment';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import store from 'state/store';

import CycleResponseForm from './CycleResponseForm';

describe('CycleResponseForm', () => {
  it('calls submit with meta data', () => {
    const cycle = {
      ordinal: 1,
      start_date: moment(new Date()),
      end_date: moment(new Date()),
    };
    const response = { body: {} };
    const onSubmit = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <CycleResponseForm
          cycle={cycle}
          response={response}
          onSubmit={onSubmit}
          updatingResponse={false}
        />
      </Provider>,
    );

    // Complete the required fields so the submit button is enabled.
    wrapper.find('input').forEach(input => {
      input.simulate('change', { target: { value: 'Foo.' } });
    });

    // Submit the form.
    wrapper
      .find('.SubmitButton')
      .hostNodes()
      .simulate('click');

    // Check what was passed to the submit handler.
    expect(onSubmit.mock.calls.length).toBe(1);
    const [firstCall] = onSubmit.mock.calls;
    const [, , { progress, module_label }] = firstCall;
    expect(progress).toBe(100);
    expect(module_label).toBeDefined();
  });
});
