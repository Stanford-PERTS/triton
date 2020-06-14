import { all, takeLatest, put, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import * as actions from './actions';
import * as organizationsApi from 'services/triton/organizations';
import organizationsSaga, {
  organizationsRequest,
  organizationRequest,
  organizationHomeRequest,
  organizationsByTeamRequest,
  organizationAddRequest,
  organizationUpdateRequest,
  organizationCodeRequest,
  organizationRemoveRequest,
  organizationDashboardRequest,
} from './sagas';
import * as types from './actionTypes';
import * as uiActions from 'state/ui/actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import selectors from 'state/selectors';
import { callWithApiAuthentication as callWithAuth } from 'state/api';
import { CLEAR_FLAGS } from 'state/actionTypes';
import { query, querySuccess } from 'state/actions';

import * as route from 'routes';

describe('organizations sagas', () => {
  it('should handle organizations requests', () => {
    const gen = organizationsSaga();

    expect(gen.next().value).toEqual(
      all([
        takeLatest(types.ORGANIZATIONS_REQUEST, organizationsRequest),
        takeLatest(types.ORGANIZATION_REQUEST, organizationRequest),
        takeLatest(types.ORGANIZATION_HOME_REQUEST, organizationHomeRequest),
        takeLatest(
          types.ORGANIZATIONS_BY_TEAM_REQUEST,
          organizationsByTeamRequest,
        ),
        takeLatest(types.ORGANIZATION_ADD_REQUEST, organizationAddRequest),
        takeLatest(
          types.ORGANIZATION_UPDATE_REQUEST,
          organizationUpdateRequest,
        ),
        takeLatest(types.ORGANIZATION_CODE_REQUEST, organizationCodeRequest),
        takeLatest(
          types.ORGANIZATION_REMOVE_REQUEST,
          organizationRemoveRequest,
        ),
        takeLatest(
          actions.queryOrganizationDashboard().type,
          organizationDashboardRequest,
        ),
      ]),
    );
  });

  it('should handle a successful organizations request', () => {
    const action = {
      type: types.ORGANIZATIONS_REQUEST,
      queryOptions: { n: 10 },
    };
    const organizations = [
      { uid: 'Organization_001', name: 'Organization One' },
      { uid: 'Organization_002', name: 'Organization Two' },
      { uid: 'Organization_003', name: 'Organization Three' },
    ];
    const links = {
      self: 'url',
      first: 'url',
      previous: 'url',
      next: 'url',
      last: 'url',
    };

    const gen = organizationsRequest(action);

    expect(gen.next().value).toEqual(select(selectors.auth.user.uid));
    expect(gen.next('User_123').value).toEqual(
      select(selectors.auth.user.isAdmin),
    );

    expect(gen.next(true).value).toEqual(
      callWithAuth(
        organizationsApi.query,
        'User_123',
        true,
        action.queryOptions,
      ),
    );

    expect(gen.next({ organizations, links }).value).toEqual(
      put(actions.queryOrganizationsSuccess(organizations, links)),
    );
  });

  it('should handle an unsuccessful organizations request', () => {
    const action = {
      type: types.ORGANIZATIONS_REQUEST,
      queryOptions: { n: 10 },
    };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = organizationsRequest(action);

    expect(gen.next().value).toEqual(select(selectors.auth.user.uid));
    expect(gen.next('User_123').value).toEqual(
      select(selectors.auth.user.isAdmin),
    );

    expect(gen.next(true).value).toEqual(
      callWithAuth(
        organizationsApi.query,
        'User_123',
        true,
        action.queryOptions,
      ),
    );

    expect(gen.throw(error).value).toEqual(
      put(actions.queryOrganizationsFailure(error)),
    );

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle a successful organization get request', () => {
    const organizationId = 'Organization_002';
    const organization = { uid: organizationId, name: 'Go Organization Two!' };
    const action = actions.getOrganization(organizationId);

    const gen = organizationRequest(action);

    expect(gen.next().value).toEqual(
      callWithAuth(organizationsApi.get, organizationId),
    );

    expect(gen.next(organization).value).toEqual(
      put(actions.getOrganizationSuccess(organization)),
    );
  });

  it('should handle an unsuccessful organization get request', () => {
    const organizationId = 'Organization_002';
    const action = actions.getOrganization(organizationId);
    const error = { code: 'server/403', message: 'Unauthorized access.' };
    const redirect = route.toHomeNoProgram();

    const gen = organizationRequest(action);

    expect(gen.next().value).toEqual(
      callWithAuth(organizationsApi.get, organizationId),
    );

    expect(gen.throw(error).value).toEqual(
      put(actions.getOrganizationFailure(error, organizationId)),
    );

    expect(gen.next().value).toEqual(put(uiActions.redirectTo(redirect)));

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  it('should handle a successful organization home request', () => {
    const program = { uid: 'Program_001', label: 'ep19' };
    const organizationId = 'Organization_001';
    const organization = {
      uid: organizationId,
      name: 'Org One',
      program_id: program.uid,
    };
    const user = { uid: 'User_001' };

    const action = { type: types.ORGANIZATION_HOME_REQUEST, organizationId };
    return expectSaga(organizationHomeRequest, action)
      .provide([
        [select(selectors.organization, { organizationId }), organization],
        [select(selectors.auth.user.uid), user.uid],
      ])
      .put(actions.getOrganization(organizationId))
      .dispatch({ type: types.ORGANIZATION_SUCCESS, organization })
      .put(query('programs'))
      .dispatch(querySuccess('programs'))
      .put(
        usersActions.updateUser({
          uid: user.uid,
          recent_program_id: program.uid,
        }),
      )
      .dispatch({ type: usersTypes.UPDATE_USER_SUCCESS })
      .put({ type: types.ORGANIZATION_HOME_SUCCESS })
      .run();
  });

  it('should handle a successful organizations by team request', () => {
    const teamId = 'Team_001';
    const action = {
      type: types.ORGANIZATIONS_BY_TEAM_REQUEST,
      teamId,
    };
    const organizations = [
      { uid: 'Organization_001', name: 'Organization One' },
      { uid: 'Organization_002', name: 'Organization Two' },
      { uid: 'Organization_003', name: 'Organization Three' },
    ];

    const gen = organizationsByTeamRequest(action);

    expect(gen.next().value).toEqual(
      callWithAuth(organizationsApi.queryByTeam, teamId),
    );

    expect(gen.next(organizations).value).toEqual(
      put({ type: types.ORGANIZATIONS_BY_TEAM_SUCCESS, organizations }),
    );
  });

  it('should handle an unsuccessful organizations by team request', () => {
    const teamId = 'Team_001';
    const action = {
      type: types.ORGANIZATIONS_BY_TEAM_REQUEST,
      teamId,
    };
    const error = { code: 'server/403', message: 'Unauthorized access.' };

    const gen = organizationsByTeamRequest(action);

    expect(gen.next().value).toEqual(
      callWithAuth(organizationsApi.queryByTeam, teamId),
    );

    expect(gen.throw(error).value).toEqual(
      put({ type: types.ORGANIZATIONS_BY_TEAM_FAILURE, error }),
    );

    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  describe('add', () => {
    it('should handle a successful request', () => {
      const organization = { uid: 'Organization_003', name: 'Go Org Three!' };
      const action = { type: types.ORGANIZATION_ADD_REQUEST, organization };

      const gen = organizationAddRequest(action);

      expect(gen.next().value).toEqual(
        callWithAuth(organizationsApi.post, organization),
      );

      expect(gen.next(organization).value).toEqual(
        put({
          type: types.ORGANIZATION_ADD_SUCCESS,
          organization,
        }),
      );

      expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));

      expect(gen.next().value).toEqual(organization);
    });

    it('should handle an unsuccessful request', () => {
      const organization = { uid: 'Organization_003', name: 'Go Org Three!' };
      const action = { type: types.ORGANIZATION_ADD_REQUEST, organization };
      const error = { code: 'server/403', message: 'Unauthorized access.' };

      const gen = organizationAddRequest(action);

      expect(gen.next().value).toEqual(
        callWithAuth(organizationsApi.post, organization),
      );

      expect(gen.throw(error).value).toEqual(
        put({ type: types.ORGANIZATION_ADD_FAILURE, error }),
      );

      expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));

      expect(gen.next().value).toEqual(undefined);
    });
  });

  describe('update', () => {
    it('should handle a successful request', () => {
      const organization = { uid: 'Organization_003', name: 'Go Org Three!' };
      const action = { type: types.ORGANIZATION_UPDATE_REQUEST, organization };

      const gen = organizationUpdateRequest(action);

      expect(gen.next().value).toEqual(
        callWithAuth(organizationsApi.update, organization),
      );

      expect(gen.next(organization).value).toEqual(
        put({ type: types.ORGANIZATION_UPDATE_SUCCESS, organization }),
      );
    });

    it('should handle an unsuccessful request', () => {
      const organization = { uid: 'Organization_003', name: 'Go Org Three!' };
      const action = { type: types.ORGANIZATION_UPDATE_REQUEST, organization };
      const error = { code: 'server/403', message: 'Unauthorized access.' };

      const gen = organizationUpdateRequest(action);

      expect(gen.next().value).toEqual(
        callWithAuth(organizationsApi.update, organization),
      );

      expect(gen.throw(error).value).toEqual(
        put({
          type: types.ORGANIZATION_UPDATE_FAILURE,
          error,
        }),
      );

      expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
    });
  });

  describe('changing code', () => {
    it('should handle a successful organization code request', () => {
      const organizationId = 'Organization_001';
      const organization = {
        uid: organizationId,
        name: 'Go Organization One!',
      };
      const action = { type: types.ORGANIZATION_CODE_REQUEST, organizationId };

      const gen = organizationCodeRequest(action);

      expect(gen.next().value).toEqual(
        callWithAuth(organizationsApi.changeCode, organizationId),
      );

      expect(gen.next(organization).value).toEqual(
        put({ type: types.ORGANIZATION_CODE_SUCCESS, organization }),
      );
    });

    it('should handle an unsuccessful organization code request', () => {
      const organizationId = 'Organization_001';
      const action = { type: types.ORGANIZATION_CODE_REQUEST, organizationId };
      const error = { code: 'server/403', message: 'Unauthorized access.' };

      const gen = organizationCodeRequest(action);

      expect(gen.next().value).toEqual(
        callWithAuth(organizationsApi.changeCode, organizationId),
      );

      expect(gen.throw(error).value).toEqual(
        put({
          type: types.ORGANIZATION_CODE_FAILURE,
          error,
          organizationId,
        }),
      );

      expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
    });
  });

  describe('remove an organization', () => {
    it('should handle a successful removal', () => {
      const program = { uid: 'Program_001', label: 'ep19' };
      const organizationId = 'Organization_001';
      const organization = {
        uid: organizationId,
        name: 'Go Organization One!',
      };
      const action = {
        type: types.ORGANIZATION_REMOVE_REQUEST,
        organizationId,
      };

      const gen = organizationRemoveRequest(action);

      expect(gen.next().value).toEqual(
        select(selectors.program, { organizationId }),
      );
      expect(gen.next(program).value).toEqual(
        callWithAuth(organizationsApi.remove, organizationId),
      );

      expect(gen.next(organization).value).toEqual(
        put({
          type: types.ORGANIZATION_REMOVE_SUCCESS,
          organizationId,
        }),
      );

      expect(gen.next().value).toEqual(
        put(uiActions.redirectTo(route.toHome(program.label))),
      );
    });

    it('should handle an unsuccessful removal', () => {
      const program = {};
      const organizationId = 'Organization_001';
      const action = {
        type: types.ORGANIZATION_REMOVE_REQUEST,
        organizationId,
      };
      const error = { code: 'server/403', message: 'Unauthorized access.' };

      const gen = organizationRemoveRequest(action);

      expect(gen.next().value).toEqual(
        select(selectors.program, { organizationId }),
      );

      expect(gen.next(program).value).toEqual(
        callWithAuth(organizationsApi.remove, organizationId),
      );

      expect(gen.throw(error).value).toEqual(
        put({
          type: types.ORGANIZATION_REMOVE_FAILURE,
          error,
          organizationId,
        }),
      );

      expect(gen.next().value).toEqual(
        put(uiActions.redirectTo(route.toHomeNoProgram())),
      );

      expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
    });
  });
});
