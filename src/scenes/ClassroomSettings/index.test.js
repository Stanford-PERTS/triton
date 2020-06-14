import React from 'react';
import ReactDOM from 'react-dom';
import noop from 'lodash/noop';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { reduxForm } from 'redux-form';

import store from 'state/store';

import ClassroomSettingsRender from './ClassroomSettingsRender';

describe('ClassroomSettings', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    const props = {
      actions: { removeClassroom: noop },
      captain: {},
      contact: {},
      handleSubmit: noop,
      hasCaptainPermission: false,
      team: {},
      teamUserNamesById: {},
      terms: { captain: '', contact: '' },
      toBack: '',
      user: {},
      submitting: false,
    };

    const RenderWithReduxForm = reduxForm({ form: 'classroomSettings' })(
      ClassroomSettingsRender,
    );

    ReactDOM.render(
      <Provider store={store}>
        <MemoryRouter>
          <RenderWithReduxForm {...props} />
        </MemoryRouter>
      </Provider>,
      div,
    );
  });
});
