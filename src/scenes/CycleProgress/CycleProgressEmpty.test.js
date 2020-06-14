import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';

import fromParams from 'utils/fromParams';

import CycleProgressEmpty from './CycleProgressEmpty';
import TermsContext from 'components/TermsContext';

jest.mock('utils/fromParams');

const terms = {
  classrooms: 'Classrooms',
  contact: 'Main Contact',
};

describe('CycleProgressEmpty', () => {
  it('shows a message when there are no classrooms, user scope', () => {
    const props = {
      // Even if there are classrooms here, it's the role of main contact that
      // matters in the user scope.
      classroomsById: { Classroom_A: { uid: 'Classroom_A', name: 'A' } },
      contactClassroomsById: {},
      participantsById: {},
    };
    fromParams.mockReturnValue({ scope: 'user' });
    const wrapper = mount(
      <Router>
        <TermsContext.Provider value={terms}>
          <CycleProgressEmpty {...props} />
        </TermsContext.Provider>
      </Router>,
    );

    expect(wrapper.find('[data-test="no-classrooms-user"]').length).toBe(1);
  });

  it('shows a message when there are no classrooms, team scope', () => {
    const props = {
      classroomsById: {},
      contactClassroomsById: {},
      participantsById: {},
    };
    fromParams.mockReturnValue({ scope: 'team' });
    const wrapper = mount(
      <Router>
        <TermsContext.Provider value={terms}>
          <CycleProgressEmpty {...props} />
        </TermsContext.Provider>
      </Router>,
    );

    expect(wrapper.find('[data-test="no-classrooms-team"]').length).toBe(1);
  });

  it('shows a message when there are no participants, user scope', () => {
    const props = {
      classroomsById: { Classroom_A: { uid: 'Classroom_A', name: 'A' } },
      contactClassroomsById: { Classroom_A: { uid: 'Classroom_A', name: 'A' } },
      // There are classrooms for this user, but no participants.
      participantsById: {},
    };
    fromParams.mockReturnValue({ scope: 'user' });
    const wrapper = mount(
      <Router>
        <TermsContext.Provider value={terms}>
          <CycleProgressEmpty {...props} />
        </TermsContext.Provider>
      </Router>,
    );

    expect(wrapper.find('[data-test="no-participants-user"]').length).toBe(1);
  });

  it('shows a message when there are no participants, team scope', () => {
    const props = {
      classroomsById: { Classroom_A: { uid: 'Classroom_A', name: 'A' } },
      contactClassroomsById: { Classroom_A: { uid: 'Classroom_A', name: 'A' } },
      participantsById: {},
    };
    fromParams.mockReturnValue({ scope: 'team' });
    const wrapper = mount(
      <Router>
        <TermsContext.Provider value={terms}>
          <CycleProgressEmpty {...props} />
        </TermsContext.Provider>
      </Router>,
    );

    expect(wrapper.find('[data-test="no-participants-team"]').length).toBe(1);
  });

  it('shows a default message if something goes wrong', () => {
    const props = {
      classroomsById: {},
      contactClassroomsById: {},
      participantsById: {},
    };
    fromParams.mockReturnValue({ scope: 'dunno?' });
    const wrapper = mount(
      <Router>
        <TermsContext.Provider value={terms}>
          <CycleProgressEmpty {...props} />
        </TermsContext.Provider>
      </Router>,
    );

    expect(wrapper.find('[data-test="unexpected"]').length).toBe(1);
  });
});
