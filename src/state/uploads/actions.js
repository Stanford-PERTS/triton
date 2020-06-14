import * as types from './actionTypes';

export const uploadReport = (fileId, file) => ({
  type: types.REPORTS_UPLOAD_REQUEST,
  fileId,
  file,
});

export const uploadReportSuccess = fileId => ({
  type: types.REPORTS_UPLOAD_SUCCESS,
  fileId,
});

export const uploadReportFailure = (fileId, error) => ({
  type: types.REPORTS_UPLOAD_FAILURE,
  fileId,
  error,
});
