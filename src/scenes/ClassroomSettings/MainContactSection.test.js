import React from 'react';
import path from 'path';
import fakeProps from 'react-fake-props';
import { shallow } from 'enzyme';

import { testSelector } from 'utils/testingUtils';

import MainContactSection from './MainContactSection';

const componentPath = path.join(__dirname, './MainContactSection.js');
const defaultProps = fakeProps(componentPath);

jest.mock('redux-form/lib/Field', () => 'field');

// | new | settings | captain permission | self |    message     |
// |-----|----------|--------------------|------|----------------|
// | X   |          | X                  | N/A  | <select>       |
// | X   |          |                    | yes  | you will be    |
// | X   |          |                    | no   | [not possible] |
// |     | X        | X                  | N/A  | <select>       |
// |     | X        |                    | yes  | you are        |
// |     | X        |                    | no   | so and so is   |

describe('MainContactSection, ClassroomNew', () => {
  it('renders contact_id Field if user has captain permission', () => {
    const props = {
      ...defaultProps,
      hasCaptainPermission: true,
    };
    const wrapper = shallow(<MainContactSection {...props} />);

    expect(wrapper.find('field[name="contact_id"]').length).toBe(1);
    expect(wrapper.find(testSelector('contact-message')).length).toBe(0);
  });

  it('renders a message if user will be main contact', () => {
    const user = { uid: 'User_contact', name: 'Foo', email: 'foo@bar.com' };
    const defaultContact = { ...user };
    const props = {
      ...defaultProps,
      contactTerm: 'Main Contact',
      defaultContact,
      user,
    };
    const wrapper = shallow(<MainContactSection {...props} />);

    expect(wrapper.find('field[name="contact_id"]').length).toBe(0);
    expect(wrapper.find(testSelector('you-will-be-contact')).length).toBe(1);
  });
});

describe('MainContactSection, ClassroomSettings', () => {
  it('renders contact_id Field if user has captain permission', () => {
    const props = {
      ...defaultProps,
      hasCaptainPermission: true,
    };
    const wrapper = shallow(<MainContactSection {...props} />);

    expect(wrapper.find('field[name="contact_id"]').length).toBe(1);
    expect(wrapper.find(testSelector('contact-message')).length).toBe(0);
  });

  it('renders a message if the contact is self, but not captain', () => {
    const user = { uid: 'User_contact', name: 'Foo', email: 'foo@bar.com' };
    const contact = { ...user };
    const props = {
      ...defaultProps,
      captainTerm: 'Captain',
      contactTerm: 'Main Contact',
      contact,
      user,
    };
    const wrapper = shallow(<MainContactSection {...props} />);

    expect(wrapper.find('field[name="contact_id"]').length).toBe(0);
    expect(wrapper.find(testSelector('you-are-contact')).length).toBe(1);
  });

  it('renders the contact if user is an unrelated team member', () => {
    const user = { uid: 'User_foo' };
    const contact = {
      uid: 'User_contact',
      name: 'Contact',
      email: 'contact@bar.com',
    };
    const props = {
      ...defaultProps,
      contact,
      user,
    };
    const wrapper = shallow(<MainContactSection {...props} />);

    expect(wrapper.find('field[name="contact_id"]').length).toBe(0);
    expect(wrapper.find(testSelector('contact-is')).length).toBe(1);
  });
});
