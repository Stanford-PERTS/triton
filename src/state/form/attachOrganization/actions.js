import * as types from './actionTypes';

// This doesn't interact with redux-forms, rather it clears our form meta
// data, see state/form/attachOrganization/reducer.js.
export const destroyAttachOrganizationFormData = team => ({
  type: types.DESTROY_ATTACH_ORGANIZATION_FORM_DATA,
});
