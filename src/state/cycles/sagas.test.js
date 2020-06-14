import { call, put, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';

import { callWithApiAuthentication as callWithAuth } from '../api';

import * as cyclesApi from 'services/triton/cycles';
import * as cyclesActions from 'state/cycles/actions';
import * as cyclesTypes from 'state/cycles/actionTypes';
import * as cyclesSagas from 'state/cycles/sagas';
import * as uiActions from 'state/ui/actions';
import selectors from 'state/selectors';
import * as routes from 'routes';

describe('cycles sagas', () => {
  const error = { code: 'server/403', message: 'Unauthorized access.' };

  describe('getCycle', () => {
    it('should get cycle', () => {
      const cycle = {
        uid: 'Cycle_001',
        ordinal: 1,
        team_id: 'Team_VIPER1234',
      };
      const action = cyclesActions.getCycle(cycle.uid);

      return expectSaga(cyclesSagas.getCycle, action)
        .provide([[call(callWithAuth, cyclesApi.get, cycle.uid), cycle]])
        .call(callWithAuth, cyclesApi.get, cycle.uid)
        .put({ type: cyclesTypes.CYCLES_GET_SUCCESS, cycle })
        .run();
    });

    it('should handle errors', () => {
      const cycle = {
        uid: 'Cycle_001',
        ordinal: 1,
        team_id: 'Team_VIPER1234',
      };
      const action = cyclesActions.getCycle(cycle.uid);

      return expectSaga(cyclesSagas.getCycle, action)
        .provide([
          [call(callWithAuth, cyclesApi.get, cycle.uid), throwError(error)],
        ])
        .put({
          type: cyclesTypes.CYCLES_GET_FAILURE,
          error,
          cycleId: action.cycleId,
        })
        .put(uiActions.redirectTo(routes.toHomeNoProgram()))
        .run();
    });
  });

  describe('addCycle', () => {
    it('should add cycle', () => {
      const cycle1 = {
        uid: 'Cycle_001',
        ordinal: 1,
        team_id: 'Team_VIPER1234',
      };
      const cycle2 = {
        uid: 'Cycle_002',
        ordinal: 2,
        team_id: 'Team_VIPER1234',
      };

      const action = cyclesActions.addCycle(cycle2);
      const { cycle } = action; // the action converts dates

      const postResponse = {
        data: cycle,
        team_cycles: [cycle1, cycle],
      };

      return expectSaga(cyclesSagas.addCycle, action)
        .provide([[call(callWithAuth, cyclesApi.post, cycle), postResponse]])
        .call(callWithAuth, cyclesApi.post, cycle)
        .put({ type: cyclesTypes.CYCLE_ADD_SUCCESS, cycle })
        .put({
          type: cyclesTypes.CYCLES_BY_TEAM_SUCCESS,
          cycles: postResponse.team_cycles,
        })
        .put(
          uiActions.redirectTo(
            routes.toProgramStep(cycle.team_id, 'cycle', cycle.uid),
          ),
        )
        .run();
    });
  });

  describe('updateCycle', () => {
    it('should update cycle', () => {
      const cycle1 = {
        uid: 'Cycle_001',
        ordinal: 1,
        team_id: 'Team_VIPER1234',
      };
      const cycle2 = {
        uid: 'Cycle_001',
        ordinal: 1,
        team_id: 'Team_VIPER1234',
        start_date: '2019-01-28',
        end_date: '2019-02-22',
      };

      const classrooms = [
        { uid: 'Classroom_001' },
        { uid: 'Classroom_002' },
        { uid: 'Classroom_003' },
      ];

      const action = cyclesActions.updateCycle(cycle2);
      const { cycle } = action; // the action converts the date

      const response = {
        data: cycle,
        team_cycles: [cycle1, cycle],
      };

      return expectSaga(cyclesSagas.updateCycle, action)
        .provide([
          [call(callWithAuth, cyclesApi.update, cycle), response],
          [
            select(selectors.team.classrooms.list, { teamId: cycle.team_id }),
            classrooms,
          ],
          [
            put(cyclesActions.queryParticipationByTeam(cycle, classrooms)),
            put({
              type: cyclesTypes.CYCLE_QUERY_PARTICIPATION_BY_TEAM_SUCCESS,
            }),
          ],
        ])
        .call(callWithAuth, cyclesApi.update, cycle)
        .put(cyclesActions.updateCycleSuccess(cycle))
        .put({
          type: cyclesTypes.CYCLES_BY_TEAM_SUCCESS,
          cycles: response.team_cycles,
        })
        .run();
    });
  });

  describe('removeCycle', () => {
    it('should remove cycle', () => {
      const cycle1 = {
        uid: 'Cycle_001',
        ordinal: 1,
        team_id: 'Team_VIPER1234',
      };
      const cycle2 = {
        uid: 'Cycle_001',
        ordinal: 2,
        team_id: 'Team_VIPER1234',
        start_date: '2019-01-28',
        end_date: '2019-02-22',
      };

      const action = cyclesActions.removeCycle(cycle2);

      const response = {
        data: null,
        team_cycles: [cycle1],
      };

      return expectSaga(cyclesSagas.removeCycle, action)
        .provide([[call(callWithAuth, cyclesApi.remove, cycle2.uid), response]])
        .call(callWithAuth, cyclesApi.remove, cycle2.uid)
        .put({
          type: cyclesTypes.CYCLES_BY_TEAM_SUCCESS,
          cycles: response.team_cycles,
        })
        .put({ type: cyclesTypes.CYCLE_REMOVE_SUCCESS, cycle: cycle2 })
        .put(uiActions.redirectTo(routes.toProgramSteps(action.cycle.team_id)))
        .run();
    });
  });
});
