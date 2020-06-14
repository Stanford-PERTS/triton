import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';

import InfoBoxTransition from './';
import { Collapse } from 'react-collapse';
import InfoBox from 'components/InfoBox';

describe('InfoBoxTransition component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<InfoBoxTransition />, div);
  });

  it('renders an InfoBox within', () => {
    const wrapper = mount(<InfoBoxTransition>Hello world</InfoBoxTransition>);
    expect(wrapper.find(InfoBox).length).toEqual(1);
  });

  describe('collapsing', () => {
    it('renders a Collapse within', () => {
      const wrapper = mount(<InfoBoxTransition>Hello world</InfoBoxTransition>);
      expect(wrapper.find(Collapse).length).toEqual(1);
    });

    it('expands when content exists', () => {
      const wrapper = mount(<InfoBoxTransition>Hello world</InfoBoxTransition>);
      expect(wrapper.find(Collapse).props().isOpened).toEqual(true);
    });

    it('collapse when no content exists', () => {
      const wrapper = mount(<InfoBoxTransition />);
      expect(wrapper.find(Collapse).props().isOpened).toEqual(false);
    });
  });
});
