import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { AppRouterRouting } from 'routes/AppRouter';
import { Provider } from 'react-redux';
import { configureStore } from 'state/store';
import forEach from 'lodash/forEach';
import mocks from 'mocks';
import selectors from 'state/selectors';

import * as routes from 'routes';
import { ModuleComponents } from 'scenes/TaskModule';
import ClassroomDetails from 'scenes/ClassroomDetails';
import ClassroomNew from 'scenes/ClassroomNew';
import ClassroomSettings from 'scenes/ClassroomSettings';
import RosterAdd from 'scenes/RosterAdd';
import SurveyInstructions from 'scenes/SurveyInstructions';
import TeamClassrooms from 'scenes/TeamClassrooms';
import TeamUserInvite from 'scenes/TeamUserInvite';
import TeamUsers from 'scenes/TeamUsers';
import UserDetails from 'scenes/UserDetails';

xdescribe('TaskModule', () => {
  // TODO figure out how to test modules that wait on loading.

  const stepType = 'single';
  const parentLabel = 'recruitment';

  const program = mocks.createProgram({
    name: 'The Engagement Project',
    label: 'demo-program',
  });
  const user = mocks.createUser();
  const team = mocks.createTeam({
    program_id: program.uid,
    program,
  });
  const classroom = mocks.createClassroom({
    team_id: team.uid,
    contact_id: user.uid,
  });
  mocks.setUserCaptain(user, team);

  const store = configureStore({
    auth: {
      user,
    },
    entities: {
      programs: {
        byId: {
          [program.uid]: program,
        },
      },
      classrooms: {
        byId: {
          [classroom.uid]: classroom,
        },
      },
      teams: {
        byId: {
          [team.uid]: team,
        },
      },
      users: {
        byId: {
          [user.uid]: user,
        },
      },
    },
  });

  describe('static routes', () => {
    it('should render toProgramTeamUserInvite', () => {
      const route = routes.toProgramTeamUserInvite(
        team.uid,
        stepType,
        parentLabel,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(TeamUserInvite)).toHaveLength(1);
    });

    it('should render toProgramTeamUserDetails', () => {
      const route = routes.toProgramTeamUserDetails(
        team.uid,
        stepType,
        parentLabel,
        user.uid,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(UserDetails)).toHaveLength(1);
    });

    it('should render toProgramTeamUsers', () => {
      const route = routes.toProgramTeamUsers(team.uid, stepType, parentLabel);

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(TeamUsers)).toHaveLength(1);
    });

    it('should render toProgramTeamClassrooms', () => {
      const route = routes.toProgramTeamClassrooms(
        team.uid,
        stepType,
        parentLabel,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(TeamClassrooms)).toHaveLength(1);
    });

    it('should render toProgramTeamClassroomNew', () => {
      const route = routes.toProgramTeamClassroomNew(
        team.uid,
        stepType,
        parentLabel,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(ClassroomNew)).toHaveLength(1);
    });

    it('should render toProgramTeamClassroom', () => {
      const route = routes.toProgramTeamClassroom(
        team.uid,
        stepType,
        parentLabel,
        classroom.uid,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(ClassroomDetails)).toHaveLength(1);
    });

    it('should render toClassroomSettings', () => {
      const route = routes.toClassroomSettings(team.uid, classroom.uid);

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(ClassroomSettings)).toHaveLength(1);
    });

    it('should render toProgramClassroomSettings', () => {
      const route = routes.toProgramClassroomSettings(
        team.uid,
        stepType,
        parentLabel,
        classroom.uid,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(ClassroomSettings)).toHaveLength(1);
    });

    it('should render toProgramTeamRosterAdd', () => {
      const route = routes.toProgramTeamRosterAdd(
        team.uid,
        stepType,
        parentLabel,
        classroom.uid,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(RosterAdd)).toHaveLength(1);
    });

    it('should render toProgramClassroomSurveyInstructions', () => {
      const route = routes.toProgramClassroomSurveyInstructions(
        team.uid,
        stepType,
        parentLabel,
      );

      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>
            <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
          </MemoryRouter>
        </Provider>,
      );

      expect(wrapper.find(SurveyInstructions)).toHaveLength(1);
    });
  });

  xdescribe('dynamic module routes', () => {
    // TODO figure out how to test modules that wait on loading.

    // TODO figure out if there's a better way to wait on redux data cycle.
    // For now, I'm just mocking the loading selectors so that the scenes
    // display instead of  rendering the Loading component.
    selectors.loading.team = () => false;
    selectors.loading.team.classrooms = () => false;
    selectors.loading.cycles = () => false;
    selectors.loading.responses = () => false;

    forEach(ModuleComponents, (Component, moduleLabel) => {
      it(`should render toProgramModule ${moduleLabel}`, () => {
        const route = routes.toProgramModule(
          team.uid,
          stepType,
          parentLabel,
          moduleLabel,
        );

        const wrapper = mount(
          <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
              <AppRouterRouting userId={user.uid} userIsLoggedIn={true} />
            </MemoryRouter>
          </Provider>,
        );

        expect(wrapper.find(Component)).toHaveLength(1);
      });
    });
  });
});
