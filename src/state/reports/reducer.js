import keyBy from 'utils/keyBy';
import _groupBy from 'lodash/groupBy';
import _values from 'lodash/values';

import * as types from './actionTypes';
import initialState from './initialState';

export default (state = initialState, action) => {
  switch (action.type) {
    // Query a team's reports
    case types.TEAM_REPORTS_REQUEST:
      return {
        ...state,
        reports: state.reports,
        error: null,
        loading: true,
      };

    case types.TEAM_REPORTS_SUCCESS:
      return {
        ...state,
        reports: {
          ...state.reports,
          ...keyBy(action.reports, 'uid'),
        },
        byTeam: {
          ...state.byTeam,
          // index by teamId, then group by the report week
          // Team_ABC001: {
          //   2017-07-31: [
          //     { uid: 'Report_ABC001' },
          //     { uid: 'Report_ABC002' },
          //   ],
          //
          //   2017-08-07: [
          //     { uid: 'Report_ABC003' },
          //     { uid: 'Report_ABC004' },
          //   ],
          //
          // }
          [action.teamId]: _groupBy(_values(action.reports), getReportWeek),
        },
        error: null,
        loading: false,
      };

    case types.TEAM_REPORTS_FAILURE:
      return {
        ...state,
        reports: state.reports,
        error: action.error,
        loading: false,
      };

    default:
      return state;
  }
};

/**
 * @param {Object} report from api
 * @returns {string} the report's filename up to the first dot, expected to be
 *     an ISO 8601 date string for a Monday.
 */
function getReportWeek(report) {
  const [, week] = /^(.*?)\./.exec(report.filename);
  return week;
}
