import { actionMethods, actionStages } from 'state/actionTypes';
import * as actions from './actions';
import * as types from './actionTypes';

describe('organizations actions', () => {
  const organization = {
    uid: 'Organization_xLVvxhai5qeAQjCR',
    name: 'Random Organization Name',
  };

  it('should create an action to request organizations', () => {
    const expectedAction = {
      actionSlice: 'ORGANIZATIONS',
      actionMethod: actionMethods.QUERY,
      actionStage: actionStages.REQUEST,
      type: types.ORGANIZATIONS_REQUEST,
    };
    expect(actions.queryOrganizations()).toEqual(expectedAction);
  });

  it('should create an action to request an organization', () => {
    const organizationId = 'Organization_001';
    const expectedAction = {
      actionSlice: 'ORGANIZATIONS',
      actionMethod: actionMethods.GET,
      actionStage: actionStages.REQUEST,
      actionUids: [organizationId],
      type: types.ORGANIZATION_REQUEST,
      organizationId,
    };
    expect(actions.getOrganization(organizationId)).toEqual(expectedAction);
  });

  it('should create an action to add new organization', () => {
    const expectedAction = {
      type: types.ORGANIZATION_ADD_REQUEST,
      organization,
    };
    expect(actions.addOrganization(organization)).toEqual(expectedAction);
  });

  it('should create an action to update an organization', () => {
    const expectedAction = {
      type: types.ORGANIZATION_UPDATE_REQUEST,
      organization,
    };
    expect(actions.updateOrganization(organization)).toEqual(expectedAction);
  });

  it('should create an action to set mode', () => {
    const mode = 'add';
    const expectedAction = {
      type: types.ORGANIZATION_MODE_SET,
      mode,
    };

    expect(actions.setOrganizationMode(mode)).toEqual(expectedAction);
  });

  it('should create an action to reset mode', () => {
    const expectedAction = {
      type: types.ORGANIZATION_MODE_RESET,
    };

    expect(actions.resetOrganizationMode()).toEqual(expectedAction);
  });
});
