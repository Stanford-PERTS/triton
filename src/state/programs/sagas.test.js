import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { querySuccess } from 'state/actions';
import { redirectTo } from 'state/ui/actions';
import { search as searchActionCreator, searchSuccess } from './actions';
import { search as searchGet } from 'services/triton/programs';
import { searchRequest } from './sagas';
import { toProgramSearch } from 'routes';
import { callWithApiAuthentication as callWithAuth } from 'state/api';

describe('program sagas', () => {
  describe('searchRequest', () => {
    it('handles successful search request', () => {
      const queryStr = 'abc';
      const programLabel = 'demo19';
      const action = searchActionCreator(queryStr, programLabel);

      return expectSaga(searchRequest, action)
        .provide([[call(callWithAuth, searchGet, programLabel, queryStr), {}]])
        .put(redirectTo(toProgramSearch(action.programLabel, action.query)))
        .call(callWithAuth, searchGet, programLabel, queryStr)
        .put.actionType(querySuccess('ORGANIZATIONS').type)
        .put.actionType(querySuccess('TEAMS').type)
        .put.actionType(querySuccess('CLASSROOMS').type)
        .put.actionType(querySuccess('USERS').type)
        .put.actionType(searchSuccess().type)
        .run();
    });
  });
});
