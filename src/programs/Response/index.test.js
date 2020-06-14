import React from 'react';
import { shallow } from 'enzyme';
import { Response } from './';

describe('Response', () => {
  const responses = [
    {
      uid: 'Response_001',
      type: 'User',
      user_id: 'User_001',
      parent_id: 'orientation',
      module_label: 'TeacherOrientation',
      body: {
        user_response_1: { value: 'Hello' },
        user_response_2: { value: 'World' },
      },
    },
    {
      uid: 'Response_002',
      type: 'User',
      user_id: 'User_002',
      parent_id: 'orientation',
      module_label: 'TeacherOrientation',
      body: {
        user_response_1: { value: 'Goodbye' },
        user_response_2: { value: 'Program' },
      },
    },
    {
      uid: 'Response_003',
      type: 'Team',
      user_id: '',
      parent_id: 'orientation',
      module_label: 'TeamSetupMeeting',
      body: {
        team_response_1: { value: 'Super Team Five!' },
      },
    },
  ];

  const defaultValue = 'No response found!';

  describe('when response not found', () => {
    it('should display defaultValue when provided', () => {
      const wrapper = shallow(
        <Response
          responseType="User"
          userId="User_NotMatched"
          parentId="orientation"
          moduleLabel="TeacherOrientation"
          responses={responses}
          defaultValue={defaultValue}
        />,
      );

      expect(wrapper.contains(defaultValue)).toBe(true);
    });

    it('should display null when no defaultValue provided', () => {
      const wrapper = shallow(
        <Response
          responseType="User"
          userId="User_NotMatched"
          parentId="orientation"
          moduleLabel="TeacherOrientation"
          responses={responses}
        />,
      );

      expect(wrapper.contains(defaultValue)).toBe(false);
      expect(wrapper.isEmptyRender()).toBe(true);
    });
  });

  describe('when field within response not found', () => {
    it('should display defaultValue when provided', () => {
      const wrapper = shallow(
        <Response
          responseType="User"
          userId="User_001"
          parentId="orientation"
          moduleLabel="TeacherOrientation"
          name="missing_field_name"
          responses={responses}
          defaultValue={defaultValue}
        />,
      );

      expect(wrapper.contains(defaultValue)).toBe(true);
    });
  });

  describe('when response and field name found', () => {
    it('should display the value (User type)', () => {
      const wrapper = shallow(
        <Response
          responseType="User"
          userId="User_002"
          parentId="orientation"
          moduleLabel="TeacherOrientation"
          name="user_response_1"
          responses={responses}
        />,
      );

      expect(wrapper.contains(responses[1].body.user_response_1.value)).toBe(
        true,
      );
    });

    it('should display the value (Team type)', () => {
      const wrapper = shallow(
        <Response
          responseType="Team"
          userId="User_002"
          parentId="orientation"
          moduleLabel="TeamSetupMeeting"
          name="team_response_1"
          responses={responses}
        />,
      );

      expect(wrapper.contains(responses[2].body.team_response_1.value)).toBe(
        true,
      );
    });
  });
});
