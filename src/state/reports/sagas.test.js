import { put } from 'redux-saga/effects';
import { callWithApiAuthentication } from 'state/api';
import * as types from './actionTypes';
import * as reportsApi from 'services/triton/reports';
import { teamReportsRequest } from './sagas';
import { queryClassroomsByTeam } from 'state/classrooms/actions';

describe('reports sagas', () => {
  it('should handle TEAM_REPORTS_REQUEST', () => {
    const action = {
      type: types.TEAM_REPORTS_REQUEST,
      teamId: 'Team_123',
    };
    const reports = [
      { uid: 'Report_001' },
      { uid: 'Report_002' },
      { uid: 'Report_003' },
    ];

    const gen = teamReportsRequest(action);

    // should call reports.queryByTeam()
    expect(gen.next().value).toEqual(
      callWithApiAuthentication(reportsApi.queryByTeam, action.teamId),
    );

    expect(gen.next(reports).value).toEqual(
      put(queryClassroomsByTeam(action.teamId)),
    );

    // should dispatch a TEAM_REPORTS_SUCCESS
    expect(gen.next().value).toEqual(
      put({ type: types.TEAM_REPORTS_SUCCESS, reports, teamId: action.teamId }),
    );
  });
});
