import * as types from './actionTypes';
import initialState from './initialState';

export default (state = initialState, action) => {
  switch (action.type) {
    case types.REPORTS_UPLOAD_REQUEST:
      return {
        reports: {
          ...state.reports,
          [action.fileId]: {
            file: action.file,
            success: null,
            error: null,
            loading: true,
          },
        },
      };

    case types.REPORTS_UPLOAD_SUCCESS:
      return {
        reports: {
          ...state.reports,
          [action.fileId]: {
            ...state.reports[action.fileId],
            success: true,
            error: null,
            loading: false,
          },
        },
      };

    case types.REPORTS_UPLOAD_FAILURE:
      return {
        reports: {
          ...state.reports,
          [action.fileId]: {
            ...state.reports[action.fileId],
            success: false,
            error: action.error,
            loading: false,
          },
        },
      };

    default:
      return state;
  }
};
