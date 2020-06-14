import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import mockStore from './mockStore';
import { App } from 'App';

describe('mockStore', () => {
  it('should mock the store', () => {
    const store = mockStore();
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>,
    );
    expect(wrapper.prop('store')).toEqual(store);
  });
});
