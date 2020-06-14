import React from 'react';
import noop from 'lodash/noop';
import store from 'state/store';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import TeamSettings from 'scenes/TeamSettings';

describe('TeamSettings', () => {
  it('displays target group section', () => {
    const team = { name: 'Team Foo' };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <TeamSettings
            initialValues={team}
            loading={false}
            onSubmit={noop}
            targetGroupEnabled={true}
            teamMode="update"
            title={'Settings'}
          />
        </Provider>
      </MemoryRouter>,
    );

    expect(
      wrapper.find('[data-test="target-group-section"]').hostNodes().length,
    ).toBe(1);
  });

  it('hides target group section', () => {
    const team = { name: 'Team Foo' };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <TeamSettings
            initialValues={team}
            loading={false}
            onSubmit={noop}
            targetGroupEnabled={false}
            teamMode="update"
            title={'Settings'}
          />
        </Provider>
      </MemoryRouter>,
    );

    expect(
      wrapper.find('[data-test="target-group-section"]').hostNodes().length,
    ).toBe(0);
  });
});
