import { all, call, put, select, take } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import mocks from 'mocks';

import * as routes from 'routes';
import selectors from 'state/selectors';
import { callWithApiAuthentication } from 'state/api';
import { CLEAR_FLAGS } from 'state/actionTypes';
import { query, querySuccess } from 'state/actions';

// teams
import * as teamsApi from 'services/triton/teams';
import * as actions from './actions';
import * as types from './actionTypes';
import * as classroomsApi from 'services/triton/classrooms';
import * as classroomsTypes from 'state/classrooms/actionTypes';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import {
  userTeamsRequest,
  teamsByOrganizationRequest,
  teamRequest,
  teamAddOnlyRequest,
  teamAddRequest,
  teamUpdateRequest,
  teamRemoveRequest,
  teamRemoveOrganizationRequest,
} from './sagas';

// surveys
import * as surveysActions from 'state/surveys/actions';
import * as surveysActionTypes from 'state/surveys/actionTypes';

// ui
import * as uiActions from 'state/ui/actions';

// mock local storage
import localStorageMock from 'utils/localStorageMock';
window.localStorage = localStorageMock;

describe('teams sagas', () => {
  const error = { code: 'server/403', message: 'Unauthorized access.' };

  it('should handle a user teams request', () => {
    const action = { type: types.USER_TEAMS_REQUEST, queryOptions: { n: 10 } };
    const teams = [
      { uid: 'Team_001', name: 'Team One' },
      { uid: 'Team_002', name: 'Team Two' },
      { uid: 'Team_003', name: 'Team Three' },
    ];
    const links = {
      self: 'url',
      first: 'url',
      previous: 'url',
      next: 'url',
      last: 'url',
    };

    const gen = userTeamsRequest(action);

    expect(gen.next().value).toEqual(select(selectors.auth.user.uid));
    expect(gen.next('User_123').value).toEqual(
      select(selectors.auth.user.isAdmin),
    );

    expect(gen.next(true).value).toEqual(
      callWithApiAuthentication(
        teamsApi.query,
        'User_123',
        true,
        action.queryOptions,
      ),
    );

    expect(gen.next({ teams, links }).value).toEqual(
      put(actions.queryTeamsByUserSuccess(teams, links)),
    );
  });

  describe('teamsByOrganizationRequest', () => {
    const organization = { uid: 'Organization_001' };
    const teams = [
      { uid: 'Team_001', name: 'Team One' },
      { uid: 'Team_002', name: 'Team Two' },
      { uid: 'Team_003', name: 'Team Three' },
    ];

    const teamsByOrganizationRequestGen = teamsByOrganizationRequest(
      actions.queryTeamsByOrganization(organization.uid),
    );

    it('should get teams from server', () => {
      expect(teamsByOrganizationRequestGen.next().value).toEqual(
        callWithApiAuthentication(
          teamsApi.queryByOrganization,
          organization.uid,
        ),
      );
    });

    it('should dispatch (and wait on) a teams survey requests', () => {
      expect(teamsByOrganizationRequestGen.next(teams).value).toEqual(
        all(teams.map(t => put(surveysActions.queryTeamSurveys(t.uid)))),
      );

      expect(teamsByOrganizationRequestGen.next().value).toEqual(
        all(teams.map(t => take(surveysActionTypes.SURVEY_BY_TEAM_SUCCESS))),
      );
    });

    it('should dispatch success', () => {
      expect(teamsByOrganizationRequestGen.next().value).toEqual(
        put(actions.queryTeamsByOrganizationSuccess(teams, organization.uid)),
      );
    });

    it('should dispatch failure, dispatch clear flags', () => {
      expect(teamsByOrganizationRequestGen.throw(error).value).toEqual(
        put(actions.queryTeamsByOrganizationFailure(error, organization.uid)),
      );

      expect(teamsByOrganizationRequestGen.next().value).toEqual(
        put({ type: CLEAR_FLAGS }),
      );
    });
  });

  describe('teamRequest', () => {
    const program = { uid: 'Program_001', label: 'ep19' };
    const team = {
      uid: 'Team_002',
      name: 'Go Team Two!',
      program_id: program.uid,
    };
    const user = { uid: 'User_001' };

    it('succeeds', () => {
      const action = actions.getTeam(team.uid);

      return expectSaga(teamRequest, action)
        .provide([
          [select(selectors.team, { teamId: team.uid }), team],
          [select(selectors.auth.user.uid), user.uid],
        ])
        .put(actions.getTeamOnly(team.uid))
        .dispatch({ type: types.TEAM_ONLY_SUCCESS })
        .put(query('programs'))
        .dispatch(querySuccess('programs'))
        .put(
          usersActions.updateUser({
            uid: user.uid,
            recent_program_id: program.uid,
          }),
        )
        .dispatch({ type: usersTypes.UPDATE_USER_SUCCESS })
        .put(surveysActions.queryTeamSurveys(team.uid))
        .put.actionType(types.TEAM_SUCCESS)
        .run();
    });

    it('should dispatch failure, dispatch clear flags', () => {
      const teamRequestGen = teamRequest(actions.getTeam(team.uid));

      // Step into try block, stopping at first yield.
      teamRequestGen.next();

      expect(teamRequestGen.throw(error).value).toEqual(
        put({
          type: types.TEAM_FAILURE,
          error: String(error),
          teamId: team.uid,
        }),
      );

      expect(teamRequestGen.next().value).toEqual(
        put(uiActions.redirectTo(routes.toHomeNoProgram())),
      );

      expect(teamRequestGen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
    });
  });

  // Add Team
  it('should handle a successful addTeamOnly request', () => {
    const program = mocks.createProgram({ uid: 'Program_001', label: 'ep19' });
    const team = {
      uid: 'Team_003',
      name: 'Go Team Three!',
      program_id: program.uid,
    };
    const action = { type: types.TEAM_ADD_REQUEST, team };

    const gen = teamAddOnlyRequest(action);

    // should call teams.post
    expect(gen.next().value).toEqual(
      call(callWithApiAuthentication, teamsApi.post, team),
    );

    // should dispatch a TEAM_ADD_SUCCESS
    expect(gen.next(team).value).toEqual(
      put({
        type: types.TEAM_ADD_SUCCESS,
        team,
        payload: team,
      }),
    );
  });

  it('should handle an unsuccessful team add request', () => {
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_ADD_REQUEST, team };

    const gen = teamAddOnlyRequest(action);

    // should call teams.post
    expect(gen.next().value).toEqual(
      call(callWithApiAuthentication, teamsApi.post, team),
    );

    // should dispatch a TEAM_ADD_FAILURE
    expect(gen.throw(error).value).toEqual(
      put({ type: types.TEAM_ADD_FAILURE, error }),
    );
  });

  describe('addTeamRequest', () => {
    const program = { label: 'demo', use_classrooms: true };
    const team = { uid: 'Team_1', name: 'Foo', captain_id: 'User_cap' };
    const user = { uid: 'User_001', name: 'Mister Snakes' };
    const classroom = {
      name: team.name,
      team_id: team.uid,
      contact_id: team.captain_id,
      program_label: program.label,
    };
    const action = actions.addTeam(team);

    it('handles an add team request', () =>
      expectSaga(teamAddRequest, action)
        .provide([
          [select(selectors.auth.user), { ...user, owned_teams: [team.uid] }],
          [select(selectors.program, { teamId: team.uid }), program],
        ])
        .put.actionType(types.TEAM_ADD_REQUEST)
        .dispatch({ type: types.TEAM_ADD_SUCCESS, payload: team })
        .put.actionType(usersTypes.UPDATE_USER_SUCCESS)
        .put(uiActions.redirectTo(routes.toTeam(team.uid)))
        .put(actions.addTeamSuccess(team.uid))
        .run());

    it('handles a add team request "rosterless"', () => {
      const rosterlessProgram = { ...program, use_classrooms: false };
      const defaultClass = {
        ...classroom,
        name: classroomsApi.DEFAULT_CLASSROOM_NAME,
      };

      return expectSaga(teamAddRequest, action)
        .provide([
          [select(selectors.auth.user), { ...user, owned_teams: [team.uid] }],
          [select(selectors.program, { teamId: team.uid }), rosterlessProgram],
          [
            call(callWithApiAuthentication, classroomsApi.post, defaultClass),
            defaultClass,
          ],
        ])
        .put.actionType(types.TEAM_ADD_REQUEST)
        .dispatch({ type: types.TEAM_ADD_SUCCESS, payload: team })
        .put.actionType(usersTypes.UPDATE_USER_SUCCESS)
        .call(callWithApiAuthentication, classroomsApi.post, defaultClass)
        .put.actionType(classroomsTypes.CLASSROOM_ADD_SUCCESS)
        .put(uiActions.redirectTo(routes.toTeam(team.uid)))
        .put(actions.addTeamSuccess(team.uid))
        .run();
    });

    it('fails if addTeamOnly fails', () =>
      expectSaga(teamAddRequest, action)
        .put.actionType(types.TEAM_ADD_REQUEST)
        .dispatch({ type: types.TEAM_ADD_FAILURE, payload: team })
        .put.actionType(actions.addTeamFailure().type)
        .run());
  });

  // Update Team
  it('should handle a successful team update request', () => {
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_UPDATE_REQUEST, team };

    const gen = teamUpdateRequest(action);

    // should call teamsApi.update
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(teamsApi.update, team),
    );

    // should dispatch a TEAM_UPDATE_SUCCESS
    expect(gen.next(team).value).toEqual(
      put({ type: types.TEAM_UPDATE_SUCCESS, team }),
    );
  });

  it('should handle an unsuccessful team update request', () => {
    const team = { uid: 'Team_003', name: 'Go Team Three!' };
    const action = { type: types.TEAM_UPDATE_REQUEST, team };

    const gen = teamUpdateRequest(action);

    // should call teams.update
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(teamsApi.update, team),
    );

    // should dispatch a TEAM_UPDATE_FAILURE
    expect(gen.throw(error).value).toEqual(
      put({
        type: types.TEAM_UPDATE_FAILURE,
        error,
      }),
    );
  });

  // Remove organization from a team.
  it('should handle a successful remove organization request', () => {
    const organizationId = 'Organization_001';
    const team = {
      uid: 'Team_003',
      name: 'Go Team Three!',
      organization_ids: [organizationId, 'Organization_002'],
    };
    const action = {
      type: types.TEAM_UPDATE_REQUEST,
      team,
      organizationId,
    };

    const gen = teamRemoveOrganizationRequest(action);

    // Should correctly remove the org id.
    const modifiedTeam = gen.next().value;
    expect(modifiedTeam.organization_ids).not.toContain(organizationId);

    expect(gen.next(modifiedTeam).value).toEqual(
      callWithApiAuthentication(teamsApi.update, modifiedTeam),
    );

    expect(gen.next(modifiedTeam).value).toEqual(
      put({ type: types.TEAM_UPDATE_SUCCESS, team: modifiedTeam }),
    );
  });

  // Remove a Team
  it('should handle a successful remove team request', () => {
    const program = { uid: 'Program_001', label: 'ep19' };
    const teamId = 'Team_002';
    const team = { uid: teamId, name: 'Go Team Two!', code: 'trout viper' };
    const action = { type: types.TEAM_REMOVE_REQUEST, team };
    const redirect = routes.toHome(program.label);

    const gen = teamRemoveRequest(action);

    expect(gen.next().value).toEqual(select(selectors.program));

    // should call teams.remove
    expect(gen.next(program).value).toEqual(
      callWithApiAuthentication(teamsApi.remove, team),
    );

    // should dispatch a TEAM_REMOVE_SUCCESS
    expect(gen.next().value).toEqual(
      put({ type: types.TEAM_REMOVE_SUCCESS, teamId }),
    );

    expect(gen.next().value).toEqual(put(uiActions.redirectTo(redirect)));

    // should dispatch CLEAR_FLAGS
    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle an unsuccessful remove team request', () => {
    const program = { uid: 'Program_001', label: 'ep19' };
    const teamId = 'Team_002';
    const team = { uid: teamId, name: 'Go Team Two!', code: 'trout viper' };
    const action = { type: types.TEAM_REQUEST, team };
    const redirect = routes.toHomeNoProgram();

    const gen = teamRemoveRequest(action);

    expect(gen.next().value).toEqual(select(selectors.program));

    // should call teams.remove
    expect(gen.next(program).value).toEqual(
      callWithApiAuthentication(teamsApi.remove, team),
    );

    // should dispatch a TEAM_REMOVE_FAILURE
    expect(gen.throw(error).value).toEqual(
      put({ type: types.TEAM_REMOVE_FAILURE, error }),
    );

    expect(gen.next().value).toEqual(put(uiActions.redirectTo(redirect)));

    // should dispatch CLEAR_FLAGS
    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });
});
