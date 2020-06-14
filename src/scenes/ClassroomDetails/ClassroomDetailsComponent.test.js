import React from 'react';
import fakeProps from 'react-fake-props';
import path from 'path';
import { shallow } from 'enzyme';

import { ClassroomDetailsComponent } from './ClassroomDetailsComponent';

// https://github.com/typicode/react-fake-props#usage
// react-fake-props requires the component path to be passed, instead of the
// component itself, to be able to support Flow and PropTypes.
// To include optional props, pass { optional: true }
const componentPath = path.join(__dirname, './ClassroomDetailsComponent.js');
const components = fakeProps(componentPath, { all: true, optional: true });
const { props: defaultProps } = components.find(
  ({ displayName }) => displayName === 'ClassroomDetailsComponent',
);

const terms = {
  captain: 'Captain',
  classroom: 'Classroom',
  contact: 'Main Contact',
  team: 'Team',
};

describe('ClassroomDetailsComponent', () => {
  it('renders without crashing', () => {
    const props = {
      ...defaultProps,
      classroomMode: 'update',
      terms,
    };
    shallow(<ClassroomDetailsComponent {...props} />);
  });
});
