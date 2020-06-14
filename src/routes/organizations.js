import toParams from 'utils/toParams';

export const toNewOrganization = (programLabel = ':programLabel') =>
  `/home/${programLabel}/organizations/new`;

export const toOrganizationDashboard = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}/dashboard`;

export const toOrganizationReports = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}/reports`;

export const toOrganizationDetails = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}`;

export const toOrganizationTeams = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}/teams`;

// Routing toOrganization defaults to showing teams tab
export const toOrganization = toOrganizationTeams;

export const toOrganizationClassrooms = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}/classrooms`;

export const toOrganizationUsers = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}/users`;

export const toOrganizationUsersInvite = (organizationId = ':organizationId') =>
  `/organizations/${toParams(organizationId)}/users/invite`;

export const toOrganizationInstructions = (
  organizationId = ':organizationId',
) => `/organizations/${toParams(organizationId)}/invite`;
