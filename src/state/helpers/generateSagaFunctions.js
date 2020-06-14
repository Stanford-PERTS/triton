// Example usage:
//
// import { all, takeEvery } from 'redux-saga/effects';
// import _map from 'lodash/map';
// import generateSagaFunctions from 'state/helpers/generateSagaFunctions';
// import * as usersApi from 'services/triton/users';
//
// const apiCalls = action => ({
//   QUERY: {
//     BY_ORGANIZATION: [usersApi.queryByOrganization, action.byId],
//     BY_TEAM: [usersApi.queryByTeam, action.byId],
//   },
//
//   GET: {
//     undefined: [usersApi.get, action.uid],
//   },
//
//   ADD: {
//     // TODO how do we handle invites?
//     undefined: [],
//   },
//
//   UPDATE: {
//     undefined: [usersApi.update, action.entity],
//   },
//
//   REMOVE: {
//     // TODO figure out how to handle sagas that don't exist
//     // Maybe it's best to leave these so that it's clear the
//     // saga is *not* handling this case?
//     undefined: [],
//   },
// });
//
// const sagaFunctions = generateSagaFunctions(apiCalls, 'users');
//
// export default function* sagas() {
//   yield all(_map(sagaFunctions, (fn, type) => takeEvery(type, fn)));
// }

import { call, put } from 'redux-saga/effects';
import { callWithApiAuthentication as callWithAuth } from 'state/api';
import { requestTypeOf } from 'state/helpers';
import * as actions from 'state/actions';
import _pick from 'lodash/pick';

const whichApiCall = (apiCalls, action) => {
  const { actionMethod, actionByEntity } = action;
  return apiCalls(action)[actionMethod][actionByEntity];

  // should we have a fallback?
  // return (
  //   apiCalls(action)[actionMethod][actionByEntity] ||
  //   apiCalls(action)[actionMethod][undefined] // fallback
  // );
};

export default (apiCalls, sliceName) => ({
  *[requestTypeOf(actions.query(sliceName))](action) {
    // Options that we'll pass back to success/failure actions.
    const passBack = _pick(action, 'byId', 'params');

    // Determine the api call we'll make
    const apiCall = whichApiCall(apiCalls, action);

    try {
      const payload = yield call(callWithAuth, ...apiCall);

      // There are a few endpoints that are placing the data not in the response
      // `body` but in a property of `body`, for example `body.organizations`.
      if (payload[sliceName.toLowerCase()]) {
        if (payload.links) {
          // If there are links packed in with payload, then we need to pull
          // them out so they can be handled by their own reducer.
          yield put(actions.queryLinks(sliceName, payload.links));
        }

        yield put(
          actions.querySuccess(
            sliceName,
            payload[sliceName.toLowerCase()],
            passBack,
          ),
        );
      } else {
        yield put(actions.querySuccess(sliceName, payload, passBack));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Saga error', action, error);
      yield put(actions.queryFailure(sliceName, error, passBack));
    }
  },

  *[requestTypeOf(actions.get(sliceName))](action) {
    // Options that we'll pass back to success/failure actions.
    const passBack = _pick(action, 'byId', 'params');

    // Determine the api call we'll make
    const apiCall = whichApiCall(apiCalls, action);

    try {
      const payload = yield call(callWithAuth, ...apiCall);
      yield put(actions.getSuccess(sliceName, action.uid, payload, passBack));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Saga error', action, error);
      yield put(actions.getFailure(sliceName, action.uid, error, passBack));
    }
  },

  *[requestTypeOf(actions.add(sliceName))](action) {
    // Options that we'll pass back to success/failure actions.
    const passBack = _pick(action, 'byId', 'params');

    // Determine the api call we'll make
    const apiCall = whichApiCall(apiCalls, action);

    try {
      const payload = yield call(callWithAuth, ...apiCall);
      yield put(actions.addSuccess(sliceName, payload, passBack));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Saga error', action, error);
      yield put(actions.addFailure(sliceName, error, passBack));
    }
  },

  *[requestTypeOf(actions.update(sliceName))](action) {
    // Options that we'll pass back to success/failure actions.
    const passBack = _pick(action, 'byId', 'params');

    // Determine the api call we'll make
    const apiCall = whichApiCall(apiCalls, action);

    try {
      const payload = yield call(callWithAuth, ...apiCall);
      yield put(actions.updateSuccess(sliceName, payload, passBack));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Saga error', action, error);
      yield put(actions.updateFailure(sliceName, error, passBack));
    }
  },

  *[requestTypeOf(actions.remove(sliceName))](action) {
    // Options that we'll pass back to success/failure actions.
    const passBack = _pick(action, 'byId', 'params');

    // Determine the api call we'll make
    const apiCall = whichApiCall(apiCalls, action);

    try {
      yield call(callWithAuth, ...apiCall);
      yield put(actions.removeSuccess(sliceName, action.uid, passBack));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Saga error', action, error);
      yield put(actions.removeFailure(sliceName, action.uid, error, passBack));
    }
  },
});
