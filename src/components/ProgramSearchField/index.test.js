import React from 'react';
import { ProgramSearchComponent } from 'components/ProgramSearchField';
import { mount } from 'enzyme';

describe('ProgramSearch', () => {
  it('dispatches when you press enter', () => {
    const searchActionCreator = jest.fn();
    const program = { label: 'demo19' };
    const query = 'abc';
    const wrapper = mount(
      <ProgramSearchComponent
        actions={{ search: searchActionCreator }}
        program={program}
      />,
    );

    const input = wrapper.find('input');
    input.simulate('change', { target: { value: query } });
    input.simulate('keypress', { key: 'Enter' });

    expect(searchActionCreator).toHaveBeenCalledWith(query, program.label);
  });
});
