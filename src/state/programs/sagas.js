import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import _map from 'lodash/map';

import * as actions from 'state/programs/actions';
import * as organizationsActions from 'state/organizations/actions';
import * as programsApi from 'services/triton/programs';
import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import generateSagaFunctions from 'state/helpers/generateSagaFunctions';
import putAndTakePayload from 'utils/putAndTakePayload';
import selectors from 'state/selectors';
import { callWithApiAuthentication } from '../api';
import { query, querySuccess } from 'state/actions';
import { redirectTo } from 'state/ui/actions';

const apiCalls = action => ({
  QUERY: {
    undefined: [programsApi.query],
  },

  GET: {
    undefined: [programsApi.get, action.uid],
  },
});

const sagaFunctions = generateSagaFunctions(apiCalls, 'programs');

function* userProgramRedirectRequest(action) {
  const authUserId = yield select(selectors.auth.user.uid);

  try {
    const { failure: userFailure } = yield putAndTakePayload(
      usersActions.getUser(authUserId),
      usersTypes.USER_SUCCESS,
      usersTypes.USER_FAILURE,
    );
    if (userFailure) {
      throw new Error(userFailure.error);
    }

    const { failure: programsFailure } = yield putAndTakePayload(
      query('programs'),
    );
    if (programsFailure) {
      throw new Error(programsFailure.error);
    }

    const user = yield select(selectors.auth.user);

    // Translate programs labels to real programs from server.
    const searchProgram = yield select(selectors.program, {
      // This action param originates in login query string.
      programLabel: action.programLabel,
    });
    const recentProgram = yield select(selectors.program, {
      programId: user.recent_program_id,
    });

    yield programRedirect(user, searchProgram || recentProgram);

    yield put(actions.userProgramRedirectSuccess());
  } catch (error) {
    yield put(actions.userProgramRedirectFailure(error));
  }
}

function* programRedirect(user, program) {
  // We can derive what program to go to. But we still need to decide if we
  // should go to the program home page, or into a team.
  let redirect;

  // Admins should never get redirect to teams.
  const isAdmin = yield select(selectors.auth.user.isAdmin);
  if (isAdmin && program) {
    redirect = routes.toHome(program.label);
  } else {
    // Non-admin teams and orgs should not be filtered by anything. This
    // preserves parity with the Home scene so calls can be cached.
    yield getTeamsAndOrgs();

    if (!program) {
      // We don't have a search param or a recently-viewed program. Maybe we
      // can choose one from the user's owned orgs or teams.
      program = yield findOwnedProgram();
    }

    if (program) {
      redirect = yield oneTeamRedirect(program);
    }
  }

  if (redirect) {
    yield put(redirectTo(redirect));
  }
}

function* getTeamsAndOrgs() {
  const { teamFailure } = yield putAndTakePayload(
    teamsActions.queryTeamsByUser(),
    teamsActions.queryTeamsByUserSuccess().type,
  );
  const { orgFailure } = yield putAndTakePayload(
    organizationsActions.queryOrganizations(),
    organizationsActions.queryOrganizationsSuccess().type,
  );
  const anyFailure = teamFailure || orgFailure;
  if (anyFailure) {
    throw new Error(anyFailure.error);
  }
}

function* findOwnedProgram() {
  let program;

  const teams = yield select(selectors.auth.user.teams.list);
  const orgs = yield select(selectors.auth.user.organizations.list);

  let ownedProgramId;
  if (teams.length > 0) {
    ownedProgramId = teams[0].program_id;
  } else if (orgs.length > 0) {
    ownedProgramId = orgs[0].program_id;
  }

  if (ownedProgramId) {
    program = yield select(selectors.program, {
      programId: ownedProgramId,
    });
  }

  return program;
}

function* oneTeamRedirect(program) {
  // Filter by program when selecting so we can tell if we meet the "one
  // team" condition for this program.
  const teams = yield select(selectors.auth.user.program.teams.list, {
    programLabel: program.label,
  });
  const orgs = yield select(selectors.auth.user.program.organizations.list, {
    programLabel: program.label,
  });

  const oneTeam =
    teams.length === 1 && orgs.length === 0 ? teams[0] : undefined;

  return oneTeam ? routes.toTeam(oneTeam.uid) : routes.toHome(program.label);
}

export function* searchRequest(action) {
  try {
    // Redirect immediately so searching feels more responsive.
    yield put(
      redirectTo(routes.toProgramSearch(action.programLabel, action.query)),
    );

    const { organizations, teams, classrooms, users } = yield call(
      callWithApiAuthentication,
      programsApi.search,
      action.programLabel,
      action.query,
    );

    const options = { queryName: action.queryName };
    yield all([
      put(querySuccess('ORGANIZATIONS', organizations, options)),
      put(querySuccess('TEAMS', teams, options)),
      put(querySuccess('CLASSROOMS', classrooms, options)),
      put(querySuccess('USERS', users, options)),
    ]);

    yield put(actions.searchSuccess());
  } catch (error) {
    console.error(error);
    yield put(actions.searchFailure(error));
  }
}

export default function* sagas() {
  yield all([
    takeLatest(actions.userProgramRedirect().type, userProgramRedirectRequest),
    takeLatest(actions.search().type, searchRequest),
    ..._map(sagaFunctions, (fn, type) => takeEvery(type, fn)),
  ]);
}
