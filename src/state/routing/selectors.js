import get from 'lodash/get';

import fromParams from 'utils/fromParams';

export const routeClassroomId = (_, props = {}) =>
  props.classroomId || fromParams(props).classroomId;

export const routeParentLabel = (_, props = {}) =>
  props.parentLabel ||
  fromParams(props).parentLabel ||
  get(props, 'step.parentLabel');

export const routeLevel = (_, props = {}) =>
  props.level || fromParams(props).level;

export const routeModuleLabel = (_, props = {}) =>
  props.moduleLabel || fromParams(props).moduleLabel;

export const routeOrganizationId = (_, props = {}) =>
  props.organizationId || fromParams(props).organizationId;

export const routeTeamId = (_, props = {}) =>
  props.teamId || fromParams(props).teamId || get(props, 'team.uid');

export const routeProgramId = (_, props = {}) =>
  props.programId || fromParams(props).programId;

export const routeProgramLabel = (_, props = {}) =>
  props.programLabel || fromParams(props).programLabel;

export const routeUserId = (_, props = {}) =>
  props.userId || fromParams(props).userId;
