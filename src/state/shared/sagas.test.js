import { all, call, takeLatest, put, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import * as types from './actionTypes';
import * as teamTypes from 'state/teams/actionTypes';
import * as uiActions from 'state/ui/actions';
import * as actions from './actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import { clearFlags } from 'state/actions';
import * as classroomsActions from 'state/classrooms/actions';
import selectors from 'state/selectors';
import { callWithApiAuthentication } from '../api';
import * as teamsApi from 'services/triton/teams';
import sharedSaga, {
  removeTeamUserRequest,
  removeOrganizationUserRequest,
  leaveTeamRequest,
  leaveOrganizationRequest,
  teamAttachOrganizationRequest,
} from './sagas';
import { updateUserRequest } from 'state/users/sagas';
import * as route from 'routes';

describe('shared sagas', () => {
  describe('leaveOrganizationRequest', () => {
    it('should remove user from organization', () => {
      const program = { uid: 'Program_001', label: 'ep19' };
      const organization = {
        uid: 'Organization_001',
        name: 'Viper Corp',
      };
      const user = {
        uid: 'User_001',
        name: 'Mister Snakes',
      };

      const action = actions.leaveOrganization(organization);

      return expectSaga(leaveOrganizationRequest, action)
        .provide([
          [select(selectors.auth.user), user],
          [
            select(selectors.program, { organizationId: organization.uid }),
            program,
          ],
        ])
        .call(removeOrganizationUserRequest, { organization, user })
        .put.actionType(types.LEAVE_ORGANIZATION_SUCCESS)
        .put(uiActions.redirectTo(route.toHome(program.label)))
        .run();
    });
  });

  it('should takeLatest shared request', () => {
    const gen = sharedSaga();

    expect(gen.next().value).toEqual(
      all([
        takeLatest(types.REMOVE_TEAM_USER_REQUEST, removeTeamUserRequest),
        takeLatest(
          types.REMOVE_ORGANIZATION_USER_REQUEST,
          removeOrganizationUserRequest,
        ),
        takeLatest(types.LEAVE_TEAM_REQUEST, leaveTeamRequest),
        takeLatest(types.LEAVE_ORGANIZATION_REQUEST, leaveOrganizationRequest),
        takeLatest(
          types.TEAM_ATTACH_ORGANIZATION_REQUEST,
          teamAttachOrganizationRequest,
        ),
      ]),
    );
  });

  it('should handle a successful remove team user request', () => {
    const team = {
      uid: 'TEAM_001',
      name: 'Team one',
    };
    const user = {
      uid: 'User_admin',
      name: 'Aaron Admin',
      email: 'admin@perts.net',
      owned_teams: ['TEAM_001'],
    };
    const userClassrooms = [
      {
        uid: 'CLASSROOM_001',
        contact_id: 'User_admin',
      },
    ];
    const action = actions.removeTeamUser(team, user);

    const gen = removeTeamUserRequest(action);

    const userWithoutTeam = {
      ...action.user,
      owned_teams: action.user.owned_teams.filter(id => id !== team.uid),
    };

    // should select user classrooms
    expect(gen.next().value).toEqual(
      select(selectors.authUser.team.classrooms.list, {
        teamId: team.uid,
        userId: user.uid,
      }),
    );

    const classrooms = userClassrooms.map(classroom => ({
      ...classroom,
      // Make the team captain the new contact for each classroom
      contact_id: team.captain_id,
    }));

    // should call updateClassroomsRequest
    expect(gen.next(userClassrooms).value).toEqual(
      all(classrooms.map(c => put(classroomsActions.updateClassroom(c)))),
    );

    // should call updateUserRequest
    expect(gen.next().value).toEqual(
      call(updateUserRequest, { user: userWithoutTeam }),
    );

    // should put REMOVE_TEAM_USER_SUCCESS
    expect(gen.next().value).toEqual(
      put({
        type: types.REMOVE_TEAM_USER_SUCCESS,
      }),
    );

    // should put clearFlags
    expect(gen.next().value).toEqual(put(clearFlags()));
  });

  it('should handle a successful remove org user request', () => {
    const organization = {
      uid: 'Organization_001',
      name: 'Organization One',
    };

    const user = {
      uid: 'User_admin',
      name: 'Aaron Admin',
      email: 'admin@perts.net',
      owned_organizations: [organization.uid],
    };

    const userWithOrganizationRemoved = {
      ...user,
      owned_organizations: [],
    };

    const action = actions.removeOrganizationUser(organization, user);

    return expectSaga(removeOrganizationUserRequest, action)
      .put(usersActions.updateUser(userWithOrganizationRemoved))
      .dispatch({ type: usersTypes.UPDATE_USER_SUCCESS })
      .put({
        type: types.REMOVE_ORGANIZATION_USER_SUCCESS,
      })
      .run();
  });

  it('should handle an unsuccessful remove team user request', () => {
    const team = {
      uid: 'TEAM_001',
      name: 'Team one',
    };
    const user = {
      uid: 'User_admin',
      name: 'Aaron Admin',
      email: 'admin@perts.net',
      owned_teams: ['TEAM_001'],
    };
    const action = actions.removeTeamUser(team, user);
    const error = { message: 'some error message' };

    const gen = removeTeamUserRequest(action);

    // should select user classrooms
    expect(gen.next().value).toEqual(
      select(selectors.authUser.team.classrooms.list, {
        teamId: team.uid,
        userId: user.uid,
      }),
    );

    // should put REMOVE_TEAM_USER_FAILURE if error is thrown
    expect(gen.throw(error).value).toEqual(
      put({
        type: types.REMOVE_TEAM_USER_FAILURE,
        error,
      }),
    );

    // should put clearFlags
    expect(gen.next().value).toEqual(put(clearFlags()));
  });

  it('should handle a successful leave team request', () => {
    const program = { uid: 'Program_001', label: 'ep19' };
    const team = {
      uid: 'TEAM_001',
      name: 'Team one',
    };
    const user = {
      uid: 'User_admin',
      name: 'Aaron Admin',
      email: 'admin@perts.net',
      owned_teams: ['TEAM_001'],
    };

    const action = actions.leaveTeam(team);

    return expectSaga(leaveTeamRequest, action)
      .provide([
        [select(selectors.auth.user), user],
        [select(selectors.program, { teamId: team.uid }), program],
      ])
      .call(removeTeamUserRequest, { team, user })
      .put({ type: types.LEAVE_TEAM_SUCCESS })
      .put(uiActions.redirectTo(route.toHome(program.label)))
      .put(clearFlags())
      .run();
  });

  it('should handle an unsuccessful leave team request', () => {
    const team = {
      uid: 'TEAM_001',
      name: 'Team one',
    };
    const action = actions.leaveTeam(team);
    const error = { message: 'some error message' };
    const gen = leaveTeamRequest(action);

    // should select current user
    expect(gen.next().value).toEqual(select(selectors.authUser));
    expect(gen.next().value).toEqual(
      select(selectors.program, { teamId: team.uid }),
    );

    // should put REMOVE_TEAM_USER_FAILURE if error is thrown
    expect(gen.throw(error).value).toEqual(
      put({
        type: types.LEAVE_TEAM_FAILURE,
        error,
      }),
    );
  });

  it('should handle a successful attach organization request', () => {
    const team = { uid: 'Team_001', organization_ids: [] };
    const organization1 = { uid: 'Organization_002', code: '123' };
    const organization2 = { uid: 'Organization_003', code: '456' };
    const organizations = [organization1, organization2];
    const action = actions.attachOrganizationToTeam(
      `${organization1.code}, ${organization2.code}`,
      team,
    );

    const gen = teamAttachOrganizationRequest(action);

    // should select current user
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(
        teamsApi.attachOrganization,
        action.team,
        action.organizationCode,
      ),
    );

    expect(gen.next(organizations).value).toEqual(
      put({ type: teamTypes.TEAM_REQUEST, teamId: action.team.uid }),
    );

    expect(gen.next().value).toEqual(
      put({ type: types.TEAM_ATTACH_ORGANIZATION_SUCCESS, organizations }),
    );
  });
});
