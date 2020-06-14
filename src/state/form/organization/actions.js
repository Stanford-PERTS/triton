import * as types from './actionTypes';

export const submitOrganizationForm = organization => ({
  type: types.SUBMIT_ORGANIZATION_FORM_REQUEST,
  organization,
});

export const submitNewOrganizationForm = organization => ({
  type: types.SUBMIT_NEW_ORGANIZATION_FORM_REQUEST,
  organization,
});
