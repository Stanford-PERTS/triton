import React from 'react';
import noop from 'lodash/noop';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store, { configureStore } from 'state/store';
import { mount } from 'enzyme';

import { SetPasswordComponent } from './';
import SetPasswordForm from './SetPasswordForm';

describe('SetPassword scene component', () => {
  const defaultProps = {
    // actions
    actions: {
      checkToken: noop,
      passwordSetReset: noop,
      setPassword: noop,
    },
    // router
    match: {
      params: {
        token: '',
      },
    },
    location: {
      search: '',
    },
    // connect
    setPasswordFormValues: {},
    disableForm: false,
  };

  it('renders without crashing', () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <SetPasswordComponent {...defaultProps} />
        </MemoryRouter>
      </Provider>,
    );
  });

  it('displays the SetPasswordForm component', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SetPasswordComponent {...defaultProps} />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.find(SetPasswordForm).length).toEqual(1);
  });
});

describe('SetPasswordForm', () => {
  const defaultProps = {
    authenticating: false,
    disabled: false,
    email: 'foo@bar.com',
    formSyncErrors: {},
    handleSubmit: noop,
    onSubmit: noop,
  };

  it('renders', () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <SetPasswordForm {...defaultProps} />
        </MemoryRouter>
      </Provider>,
    );
  });

  it('disables when token has a problem', () => {
    // Another test, another adventure. This component has "sync errors" set
    // by a form-specific reducer AND a sync validator function that checks
    // required fields. The normal behavior is for the scene to check the
    // token in the request string, and if the server response 4xx, the reducer
    // sets a sync error with key '_form'. This test wasn't working until I
    // realized that the validator was initializing errors as {}, which
    // squelched the one from the reducer. This fixed it:
    // export const validator = (values, props) = {
    //   const errors = props.formSyncErrors; // may have token error
    //   /* ... */
    // };
    const initialState = {
      form: {
        setPassword: {
          syncErrors: {
            _form: 'some message set by reducer',
          },
        },
      },
    };
    const mockStore = configureStore(initialState);

    const wrapper = mount(
      <Provider store={mockStore}>
        <MemoryRouter>
          <SetPasswordForm {...defaultProps} />
        </MemoryRouter>
      </Provider>,
    );
    wrapper
      .find('input')
      .forEach(node => expect(node.props().disabled).toBe(true));
    expect(wrapper.find('button[type="submit"]').props().disabled).toBe(true);
    expect(wrapper.find('.FieldError').length).toBe(1);
  });
});
