import cloneDeep from 'lodash/cloneDeep';
import escapeStringRegexp from 'escape-string-regexp';
import filter from 'lodash/filter';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import forOwn from 'lodash/forOwn';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import moment from 'moment';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import round from 'lodash/round';
import set from 'lodash/set';
import uniq from 'lodash/uniq';
import values from 'lodash/values';
import { createSelector } from 'reselect';
import { getFormValues } from 'redux-form';

import getKind from 'utils/getKind';
import getLongUid from 'utils/getLongUid';
import pickSecondWhereInFirstByKeys from 'utils/pickSecondWhereInFirstByKeys';
import {
  createAnnotatedSelector,
  queryResultsSelector,
} from 'utils/createSelectors';

import * as routing from './routing/selectors';
import auth from 'state/auth/selectors';
import { loading, adding, updating, deleting } from './ui/selectors.loading';
import { redirect } from './ui/selectors.redirect';

const convertDatesToMoment = entity => {
  if (!entity) {
    return entity;
  }

  const updatedEntity = cloneDeep(entity);

  const datePaths = [
    // cycles
    'cycle_dates',
    'end_date',
    'extended_end_date',
    'meeting_datetime',
    'resolution_date',
    'start_date',
    // teams
    'task_data.observation_datetime',
    'task_data.meeting_datetime',
    'task_data.resolution_date',
  ];

  datePaths.forEach(path => {
    const v = get(entity, path);
    if (v && moment(v).isValid()) {
      set(updatedEntity, path, moment(v));
    }
  });

  if (updatedEntity.start_date && updatedEntity.end_date) {
    updatedEntity.cycle_dates = [
      updatedEntity.start_date,
      updatedEntity.end_date,
    ];
  }

  return updatedEntity;
};

const _formData = state => state.form;

const _authUser = state => state.auth.user;

const _classroomsData = state => state.entities.classrooms;
const _classroomsById = state => state.entities.classrooms.byId;
const _participationByClassroomId = state =>
  state.entities.classrooms.participationByClassroom;

const _cyclesData = state => state.entities.cycles;
const _cyclesById = state => state.entities.cycles.byId;
const _classroomParticipationByCycleId = state =>
  state.entities.cycles.classroomParticipationById;
const _classroomCompletionByCycleId = state =>
  state.entities.cycles.classroomCompletionById;

const _dashboardData = state => state.dashboard;

const _digestsById = state => state.entities.digests.byId;

const _linksOrganizations = state => state.entities.organizations.links;
const _linksTeams = state => state.entities.teams.links;

const _metricsData = state => state.entities.metrics;
const _metricsById = state => state.entities.metrics.byId;

const _organizationsData = state => state.entities.organizations;
const _organizationsById = state => state.entities.organizations.byId;
const _organizationsLastFetched = state =>
  state.entities.organizations.lastFetched;

const _participantsData = state => state.entities.participants;
const _participantsById = state => state.entities.participants.byId;

const _reportsData = state => state.entities.reports;
const _reportsById = state => state.entities.reports.byId;

const _responsesData = state => state.entities.responses;
const _responsesById = state => state.entities.responses.byId;

const _sharedData = state => state.sharedData;

const _surveysData = state => state.entities.surveys;
const _surveysById = state => state.entities.surveys.byId;

const _teamsData = state => state.entities.teams;
const _teamsById = state => state.entities.teams.byId;
const _teamsLastFetched = state => state.entities.teams.lastFetched;

const _programsById = state => state.entities.programs.byId;

export const _usersData = state => state.entities.users;
export const _usersById = state => state.entities.users.byId;

const _emailTemplates = state => state.entities.emailTemplates;

// const _uiLoadingEntities = state => state.ui.loading.entities;
const _uiLoadingParents = state => state.ui.loading.parents;
// const _uiLoadingSlices = state => state.ui.loading.slices;

const error = (state, props) => undefined;
error.cycles = createSelector(
  _cyclesData,
  state => state.error,
);
error.participants = createSelector(
  _participantsById,
  state => state.error,
);
error.teams = createSelector(
  _teamsData,
  state => state.error,
);

// Loading, Adding, Updating, Removing override selectors
const isAdding = state => state.adding;
const isDeleting = state => state.deleting;
const isLoading = state => state.loading;
const isUpdating = state => state.updating;

adding.classrooms = createSelector(
  _classroomsData,
  isAdding,
);

adding.teams = createSelector(
  _teamsData,
  isAdding,
);

deleting.classrooms = createSelector(
  _classroomsData,
  isDeleting,
);

deleting.organizations = createSelector(
  _organizationsData,
  isDeleting,
);

deleting.team = createSelector(
  _teamsData,
  isDeleting,
);

loading.authUser = createSelector(
  _authUser,
  _usersById,
  (authUser, uById) =>
    // Temp solution to make sure that the authUser's Neptune and Triton user
    // data have both arrived. Since there are a few pages that expect both
    // bits to be loaded before authUser behaves like other users, the authUser
    // saga should probably combine data and not signal data has completed
    // loading until then. TODO fix up the authUser saga to load Neptune and
    // Triton data together.
    authUser && Boolean(authUser.loading || !uById[authUser.uid]),
);

loading.classrooms = createSelector(
  _classroomsData,
  isLoading,
);

// TODO REMOVE. Temporary flag until we resolve #673.
loading.classroomDetails = createSelector(
  _classroomsData,
  state => state.loadingClassroomDetails,
);
loading.cycles = createSelector(
  _cyclesData,
  isLoading,
);
loading.cyclesParticipation = createSelector(
  _cyclesData,
  state => state.loadingParticipation,
);
loading.cyclesCompletion = createSelector(
  _cyclesData,
  state => state.loadingCompletion,
);
loading.metrics = createSelector(
  _metricsData,
  isLoading,
);
loading.organizations = createSelector(
  _organizationsData,
  isLoading,
);
loading.participants = createSelector(
  _participantsData,
  isLoading,
);

loading.reports = createSelector(
  _reportsData,
  isLoading,
);

loading.responses = createSelector(
  _responsesData,
  isLoading,
);

loading.shared = createSelector(
  _sharedData,
  isLoading,
);

loading.surveys = createSelector(
  _surveysData,
  isLoading,
);
loading.teams = createSelector(
  _teamsData,
  isLoading,
);
loading.users = createSelector(
  _usersData,
  isLoading,
);
loading.team.users = createSelector(
  _uiLoadingParents,
  routing.routeTeamId,
  (parents, teamId) => parents[teamId] && parents[teamId].USERS,
);

updating.classrooms = createSelector(
  _classroomsData,
  isUpdating,
);

updating.cycles = createSelector(
  _cyclesData,
  isUpdating,
);

updating.participants = createSelector(
  _participantsData,
  isUpdating,
);

updating.responses = createSelector(
  _responsesData,
  isUpdating,
);

updating.teams = createSelector(
  _teamsData,
  isUpdating,
);

updating.users = createSelector(
  _usersData,
  isUpdating,
);

const links = {};

links.organizations = createSelector(
  _linksOrganizations,
  l => l,
);

links.teams = createSelector(
  _linksTeams,
  l => l,
);

// redux-form selectors
// To take advantage of the form selectors below:
// 1) Provide the form name to the component that will be using the form
//    selectors via the `form` prop.
// 2) If you need to dynamically name the form, you can do so by providing the
//    redux-form component the form name via the `form` prop. When doing so,
//    make sure that you do __NOT__ manually specify via the config:
//        reduxForm({ form: 'manuallySpecifiedFormName' })
//    See TaskInputCycleDateRange as an example.
const formName = (_, props = {}) => props.form;
const form = createSelector(
  _formData,
  formName,
  (f = {}, name) => f[name],
);
form.values = createSelector(
  form,
  (f = {}) => f.values || {},
);
form.initial = createSelector(
  form,
  (f = {}) => f.initial,
);
form.submitting = createSelector(
  form,
  (f = {}) => f.submitting,
);
form.syncErrors = createSelector(
  form,
  (f = {}) => f.syncErrors,
);
form.error = createSelector(
  form,
  (f = {}) => f.error,
);
form.errorCode = createSelector(
  form,
  (f = {}) => (f.submitErrors || {})._code,
);
form.redirect = createSelector(
  form,
  (f = {}) => f.redirect,
);
form.registeredFields = createSelector(
  form,
  (f = {}) => f.registeredFields,
);

// Alias to make transition to newSelectors pattern easier
// TODO update all instances of authUser to auth.user
const authUser = auth.user;

authUser.organizations = createAnnotatedSelector(
  authUser,
  _organizationsById,
  authUser.isAdmin,
  (u = { owned_organizations: [] }, oById = {}, isAdmin) =>
    isAdmin ? oById : pickBy(oById, o => u.owned_organizations.includes(o.uid)),
);

authUser.fetchedOrganizations = createAnnotatedSelector(
  authUser.organizations,
  _organizationsLastFetched,
  (authOrgs = {}, organizationsLastFetched = []) =>
    pickBy(authOrgs, o => organizationsLastFetched.includes(o.uid)),
);

authUser.teams = createAnnotatedSelector(
  authUser,
  _teamsById,
  authUser.isAdmin,
  (u = { owned_teams: [] }, tById = {}, isAdmin) =>
    isAdmin ? tById : pickBy(tById, t => u.owned_teams.includes(t.uid)),
);

authUser.fetchedTeams = createAnnotatedSelector(
  authUser.teams,
  _teamsLastFetched,
  (authTeams = {}, teamsLastFetched = []) =>
    pickBy(authTeams, t => teamsLastFetched.includes(t.uid)),
);

const users = createAnnotatedSelector(_usersById, u => u);

users.byEmail = createSelector(
  users,
  (uById = {}) => keyBy(uById, 'email'),
);

users.queryResults = {
  programSearch: queryResultsSelector(_usersData, 'programSearch'),
};

const user = createSelector(
  _usersById,
  routing.routeUserId,
  (uById = {}, userId) => uById[userId],
);

// note: likely to be nearly identical to authUser.teams
user.teams = createAnnotatedSelector(user, _teamsById, (u = {}, tById = {}) =>
  pickBy(tById, t => u.owned_teams.includes(t.uid)),
);

const teams = createAnnotatedSelector(_teamsById, t => t);

teams.namesById = createAnnotatedSelector(teams, (tById = {}) =>
  mapValues(tById, t => t.name),
);

teams.queryResults = {
  programSearch: queryResultsSelector(_teamsData, 'programSearch'),
};

// The visible team.
const team = createSelector(
  routing.routeTeamId,
  _teamsById,
  (teamId, tById = {}) => tById[teamId] && convertDatesToMoment(tById[teamId]),
);

// The team's classrooms.
team.classrooms = createAnnotatedSelector(
  team,
  _classroomsById,
  (t = {}, cById = {}) => pickBy(cById, c => c.team_id === t.uid),
);

// team.classrooms.names = createSelector(
//   team.classrooms.list,
//   (teamClassrooms = []) => teamClassrooms.map(c => c.name),
// );

// The team's classrooms where authUser is also the contact.
team.classrooms.authUser = createAnnotatedSelector(
  team.classrooms,
  auth.user.uid,
  (cById = {}, userId) =>
    pickBy(cById, classroom => classroom.contact_id === userId),
);

// participationByClassroomId entries of the team's classrooms.
team.classrooms.participation = createAnnotatedSelector(
  team.classrooms,
  _participationByClassroomId,
  pickSecondWhereInFirstByKeys,
);

team.anyRostersEmpty = createSelector(
  team.classrooms,
  cById => values(cById).some(c => c.num_students === 0),
);

team.cycles = createAnnotatedSelector(
  team,
  _cyclesById,
  (t = {}, cById = {}) => {
    const teamCycles = pickBy(cById, c => c.team_id === t.uid);
    return mapValues(teamCycles, c => convertDatesToMoment(c));
  },
);

// Instead of using createAnnotatedSelector above, we're generating the `list`
// selector manually because we're sorting by `start_date` not by `name`.
team.cycles.list = createSelector(
  team.cycles,
  cycles => values(cycles).sort((a, b) => a.ordinal - b.ordinal),
);

// Returns true if first three cycles have a start_date and end_date set.
team.cycles.scheduled = createSelector(
  team.cycles.list,
  cycles =>
    cycles[0] &&
    cycles[0].start_date &&
    cycles[0].end_date &&
    cycles[1] &&
    cycles[1].start_date &&
    cycles[1].end_date &&
    cycles[2] &&
    cycles[2].start_date &&
    cycles[2].end_date,
);

/**
 * The end date used to query participation for a cycle.
 * @param  {Cycle} cycle from the db
 * @return {moment}      extended end date, defaulting to user-set end date.
 * @comment See notes in cycle.py on various kinds of dates.
 */
const effectiveEndDate = cycle => cycle.extended_end_date || cycle.end_date;

// Most strict: a cycle is active if the current date is within its date range.
team.cycles.active = createSelector(
  team.cycles.list,
  (cycles = []) =>
    cycles.find(
      c =>
        (moment().isAfter(c.start_date) &&
          moment().isBefore(effectiveEndDate(c))) ||
        moment().isSame(c.start_date) ||
        moment().isSame(effectiveEndDate(c)),
    ),
);

// Least strict: the active cycle, or else the previous cycle, or else the next
// cycle.
team.cycles.current = createSelector(
  team.cycles.list,
  team.cycles.active,
  (cycles = [], activeCycle) => {
    const previousCycle = cycles.find(
      c =>
        moment().isAfter(effectiveEndDate(c)) ||
        moment().isSame(effectiveEndDate(c)),
    );
    const nextCycle = cycles.find(
      c => moment().isBefore(c.start_date) || moment().isSame(c.start_date),
    );

    if (activeCycle) {
      return activeCycle;
    }
    if (previousCycle) {
      return previousCycle;
    }
    return nextCycle;
  },
);

team.cycles.disabledDate = createSelector(
  team.cycles.list,
  routing.routeParentLabel,
  (c, parentLabel) => date => {
    // Return true if the `date` provided is within any cycle's
    // start_date - end_date range.
    // Assumes parentLabel is a cycle uid.
    for (let i = 0; i < c.length; i += 1) {
      // don't disable dates the date range that belongs to the
      // cycle that user is attempting to change
      if (parentLabel === c[i].uid) {
        continue;
      }

      if (date.isBetween(c[i].start_date, c[i].end_date, 'day', '[]')) {
        return true;
      }
    }

    return false;
  },
);

// Only orgs in the store will be returned, which may not be all relevant ones
// if the user doesn't have permission to query them from the server.
team.organizations = createAnnotatedSelector(
  team,
  _organizationsById,
  (t, oById = {}) =>
    t && pickBy(oById, o => t.organization_ids.includes(o.uid)),
);

team.reports = createAnnotatedSelector(
  team,
  _reportsById,
  (t = {}, rById = {}) => pickBy(rById, r => r.team_id === t.uid),
);

team.survey = createSelector(
  // Using `routeTeamId` from route/props, instead of `team`, even though this
  // is on `team`, because some sagas expect team surveys to be loaded before
  // the team.
  routing.routeTeamId,
  _surveysById,
  (tId, sById = {}) => find(sById, s => s.team_id === tId),
);

team.teamReports = createAnnotatedSelector(
  team.reports,
  _reportsById,
  (t = {}, rById = {}) => {
    const teamReports = pickBy(rById, r => !r.classroom_id);
    return mapValues(teamReports, r => ({ ...r, name: t.name }));
  },
  //       // Sort by report name
  //       // https://stackoverflow.com/questions/2167602/optimum-way-to-compare-strings-in-javascript
  //       // https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript/16481400#16481400
  //       .sort((a, b) => a.name.localeCompare(b.name)),
);

team.classroomReports = createAnnotatedSelector(
  team.reports,
  _reportsById,
  (t = {}, rById = {}) => pickBy(rById, r => r.classroom_id),
);

team.users = createAnnotatedSelector(team, _usersById, (t = {}, uById = {}) =>
  pickBy(uById, u => u.owned_teams.includes(t.uid)),
);

team.users.namesById = createSelector(
  team.users,
  (uById = {}) => mapValues(uById, u => u.name || u.email),
);

team.users.atLeastTwo = createSelector(
  team.users.list,
  teamUsersList => teamUsersList.length >= 2,
);

team.captain = createSelector(
  team,
  _usersById,
  (t = {}, uById = {}) => uById[t.captain_id],
);

team.defaultContact = createSelector(
  auth.user,
  team.captain,
  team.users.listProp('uid'),
  (currentUser = {}, captain = {}, memberIds) =>
    memberIds.includes(currentUser.uid) ? currentUser : captain,
);

team.participants = createAnnotatedSelector(
  team,
  _participantsById,
  (t = {}, pById = {}) => pickBy(pById, p => p.team_id === t.uid),
);

// Helpers for counting participation percentages.

// N.B. This is not the number of unique students on the team. Rather it
// is the number of times we expect the survey to completed by students
// to reach 100% participation. Students who are in multiple classrooms
// are expected to complete the survey multiple times.
const sumOfNumStudents = (count, current) => count + current.num_students;
const sumOfStudentsCompleted = (count, current, all) =>
  current.value === '100' ? count + current.n : count;

// The visible cycle
const cycle = createSelector(
  routing.routeParentLabel,
  _cyclesById,
  (parentLabel, cById = {}) => {
    const cycleId = getLongUid('Cycle', parentLabel);
    return cById[cycleId] && convertDatesToMoment(cById[cycleId]);
  },
);

cycle.participationByClassroom = createAnnotatedSelector(
  team.classrooms.listProp('uid'),
  routing.routeParentLabel,
  _classroomParticipationByCycleId,
  (classroomIds = [], parentLabel, participation = {}) => {
    // Assumes parentLabel is a cycle uid.
    const cycleId = getLongUid('Cycle', parentLabel);
    const cycleParticipation = participation[cycleId] || {};
    return pick(cycleParticipation, classroomIds);
  },
);

cycle.participationPercent = createSelector(
  team,
  cycle,
  (t = {}, cy = {}) =>
    // Must be truthy; avoid divide-by-zero and undefined.
    t.participation_base
      ? round(((cy.students_completed || 0) / t.participation_base) * 100)
      : 0,
);

// Total number of students who have completed participation (progress 100) for
// the current cycle, for the current team, across all classrooms.
cycle.numOfStudentsCompleted = createSelector(
  cycle.participationByClassroom,
  (participation = {}) =>
    flatten(values(participation)).reduce(sumOfStudentsCompleted, 0),
);

/**
 * Old code for calculating a whole-team percent complete for this cycle by
 * summing across classrooms. Now this data is stored directly on the cycle.
 * @return {Function}                                selector
 */
cycle.participationPercentDerived = createSelector(
  team.classrooms.list,
  cycle.participationByClassroom,
  (classrooms = [], participation = {}) => {
    // Sum up num_students across all team classrooms.
    const teamNumStudents = classrooms.reduce(sumOfNumStudents, 0);

    // Count up participant data reporting progress (value) at 100.
    // Note: this applies regardless of `survey_ordinal`, which generally
    // tracks (not guaranteed) cycle ordinal.
    const teamNumStudentsCompleted = flatten(values(participation)).reduce(
      sumOfStudentsCompleted,
      0,
    );

    // Then return the percentage of students completed to all team students.
    return teamNumStudents === 0
      ? 0
      : round((teamNumStudentsCompleted / teamNumStudents) * 100);
  },
);

cycle.participationPercent.complete80 = createSelector(
  cycle.participationPercent,
  (pct = 0) => pct >= 80,
);

/**
 * See comment on cycle.participationPercentDerived
 * @return {Function}                                   selector
 */
cycle.participationPercentDerived.complete80 = createSelector(
  cycle.participationPercentDerived,
  (pct = 0) => pct >= 80,
);

// participationByClassroomId entries of the team's classrooms where authUser
// is also the contact.
cycle.participationByClassroom.authUser = createAnnotatedSelector(
  team.classrooms.authUser,
  cycle.participationByClassroom,
  pickSecondWhereInFirstByKeys,
);

/**
 * "Derived" because it is calculated from classroom-level stats pulled from
 * Neptune.
 * @return {Function}                                              selector
 */
cycle.participationPercentDerived.authUser = createSelector(
  team.classrooms.authUser.list,
  cycle.participationByClassroom.authUser.list,
  (classrooms = [], participation = []) => {
    // Sum up num_students across all team classrooms.
    const teamNumStudents = classrooms.reduce(sumOfNumStudents, 0);

    // Count up participant data reporting progress (value) at 100.
    const teamNumStudentsCompleted = flatten(participation).reduce(
      sumOfStudentsCompleted,
      0,
    );

    // Then return the percentage of students completed to all team students.
    return teamNumStudents === 0
      ? 0
      : round((teamNumStudentsCompleted / teamNumStudents) * 100);
  },
);

// Returns the completion data of current cycle, indexed by classroom.
// e.g. {Classroom_A: [{participant_id, value}, ...], ...}
cycle.completion = createSelector(
  cycle,
  _classroomCompletionByCycleId,
  (cy = {}, compByCycleId = {}) => compByCycleId[cy.uid] || {},
);

// Add classroom association to completion objects and flatten for display.
cycle.completionRows = createSelector(
  cycle.completion,
  compByClassroomId =>
    Object.entries(compByClassroomId)
      .map(([classroomId, compList]) =>
        compList.map(row => ({ ...row, classroomId })),
      )
      .reduce((compList, acc) => acc.concat(compList), []),
);

// Responses
const responses = createAnnotatedSelector(_responsesById, r => r);

// All of the user's responses.
responses.user = createAnnotatedSelector(
  responses,
  auth.user.uid,
  (rById = {}, userId) => pickBy(rById, r => r.user_id === userId),
);

// All of the user's response to module, including other cycles.
responses.user.module = createAnnotatedSelector(
  responses.user,
  routing.routeTeamId,
  routing.routeModuleLabel,
  (userResponses = {}, teamId = '', moduleLabel = '') =>
    pickBy(
      userResponses,
      r => r.team_id === teamId && r.module_label === moduleLabel,
    ),
);

// The user's response to this cycle's (or single step) response.
responses.user.module.step = createAnnotatedSelector(
  responses.user.module,
  routing.routeParentLabel,
  (userModuleResponses = {}, parentLabel = '') =>
    find(userModuleResponses, r => r.parent_id === parentLabel),
);

// All of the team's responses.
responses.team = createAnnotatedSelector(
  responses,
  routing.routeTeamId,
  (rById = {}, teamId = '') =>
    // console.log('responses.team', rById, teamId) ||
    pickBy(rById, r => r.team_id === teamId),
);

// All of the team's responses for this step (single or cycle).
responses.team.step = createAnnotatedSelector(
  responses.team,
  routing.routeParentLabel,
  (teamResponses = {}, parentLabel = '') =>
    // console.log('responses.team.step', teamResponses, parentLabel) ||
    pickBy(teamResponses, r => r.parent_id === parentLabel),
);

// All of the team's responses for this module
responses.team.step.module = createAnnotatedSelector(
  responses.team.step,
  routing.routeModuleLabel,
  (teamResponses = {}, moduleLabel = '') =>
    // console.log('responses.team.step.module', teamResponses, moduleLabel) ||
    pickBy(teamResponses, r => r.module_label === moduleLabel),
);

// The shared response for this team's module
// Team and Cycle level responses won't be stored with a user uid.
responses.team.step.module.shared = createAnnotatedSelector(
  responses.team.step.module,
  (teamResponses = {}) =>
    // console.log('responses.team.step.module.shared', teamResponses) ||
    find(teamResponses, r => r.user_id === ''),
);

// Percentage of teachers on a team that have completed the module.
responses.team.step.module.percentComplete = createAnnotatedSelector(
  team.users.list,
  responses.team.step.module.list,
  (teamUsersList = [], rs = []) => {
    const completeResponses = rs.filter(r => r.progress === 100);
    return teamUsersList.length > 0
      ? Math.floor((completeResponses.length / teamUsersList.length) * 100)
      : 0;
  },
);

const classrooms = createAnnotatedSelector(_classroomsById, c => c);

classrooms.queryResults = {
  programSearch: queryResultsSelector(_classroomsData, 'programSearch'),
};

const classroom = createSelector(
  routing.routeClassroomId,
  _classroomsById,
  (cId, cById = {}) => cById[cId],
);

classroom.contact = createSelector(
  classroom,
  _usersById,
  (c = {}, uById = {}) => uById[c.contact_id],
);

// Returns the participation data of current cycle of classroom.
classroom.participationByCycle = createAnnotatedSelector(
  classroom,
  team.cycles.current,
  _classroomParticipationByCycleId,
  (cl = {}, cy = {}, participation = {}) => {
    const classroomId = cl.uid;
    const cycleId = cy.uid;

    if (participation[cycleId] && participation[cycleId][classroomId]) {
      return participation[cycleId][classroomId];
    }

    return [];
  },
);

// Returns the completion data of current cycle of classroom.
// e.g. [{participant_id, value}, ...]
classroom.completionByCycle = createSelector(
  classroom,
  team.cycles.active,
  _classroomCompletionByCycleId,
  (cl = {}, cy = {}, completion = {}) => {
    const classroomId = cl.uid;
    const cycleId = cy.uid;

    if (completion[cycleId] && completion[cycleId][classroomId]) {
      return completion[cycleId][classroomId];
    }

    return [];
  },
);

classroom.completionByParticipantId = createSelector(
  classroom.completionByCycle,
  (completion = {}) => {
    const byId = {};
    completion.forEach(row => (byId[row.participant_id] = row.value));
    return byId;
  },
);

// Returns the percent of students that have participated in the current cycle
// for the classroom.
classroom.participationByCycle.percent = createSelector(
  classroom,
  classroom.participationByCycle,
  (cl = {}, participation = []) => {
    const numStudents = cl.num_students;

    if (numStudents === 0) {
      return 0;
    }

    // Count up participant data report progress (value) at 100.
    const numStudentsCompleted = flatten(participation).reduce(
      sumOfStudentsCompleted,
      0,
    );

    // Then return the percentage of students completed to all team students.
    return numStudentsCompleted === 0
      ? 0
      : round((numStudentsCompleted / numStudents) * 100);
  },
);

classroom.participants = createAnnotatedSelector(
  routing.routeClassroomId,
  _participantsById,
  (classroomId, pById = {}) =>
    pickBy(pById, p => p.classroom_ids.includes(classroomId)),
);

// Override `.list` created by `createAnnotatedSelector` because it sorts on
// the `.name` property and we need to sort on `.student_id`.
classroom.participants.list = createSelector(
  classroom.participants,
  participants =>
    values(participants).sort((a, b) =>
      // sort alphabetically on student_id
      a.student_id.localeCompare(b.student_id),
    ),
);

const organizations = createAnnotatedSelector(_organizationsById, o => o);

organizations.queryResults = {
  programSearch: queryResultsSelector(_organizationsData, 'programSearch'),
};

// @todo(chris): this could be replaced by properly dispatching a
// QUERY_ORGANIZATION_SUCCESS and looking at lastFetched, and then we wouldn't
// have this extra slice hanging around.
const attachOrganizationFormData = state => state.attachOrganizationFormData;

organizations.attached = createAnnotatedSelector(
  organizations,
  attachOrganizationFormData,
  (oById = {}, formData) =>
    pickBy(oById, o => (formData.submittedOrganizations || []).includes(o.uid)),
);

organizations.attachedError = createSelector(
  attachOrganizationFormData,
  (formData = {}) => formData.error,
);

const organization = createSelector(
  routing.routeOrganizationId,
  _organizationsById,
  (orgId, oById = {}) => oById[orgId],
);

organization.teams = createAnnotatedSelector(
  organization,
  _teamsById,
  (o = {}, tById = {}) =>
    pickBy(tById, t => t.organization_ids.includes(o.uid)),
);

organization.classrooms = createAnnotatedSelector(
  organization.teams.listProp('uid'),
  _classroomsById,
  (tIds = [], cById = {}) => pickBy(cById, c => tIds.includes(c.team_id)),
);

organization.users = createAnnotatedSelector(
  organization,
  _usersById,
  (o = {}, uById = {}) =>
    pickBy(uById, u => u.owned_organizations.includes(o.uid)),
);

const metrics = createAnnotatedSelector(_metricsById, m => m);

const programs = createAnnotatedSelector(
  authUser.isAdmin,
  _programsById,
  routing.routeProgramLabel,
  authUser.teams.list,
  authUser.organizations.list,
  (isAdmin, pById, pLabel, userTeams, userOrgs) => {
    if (isAdmin) {
      return pById;
    }
    const programIds = new Set([
      ...userTeams.map(t => t.program_id),
      ...userOrgs.map(o => o.program_id),
    ]);
    // We should also return the route's current program, even if it's not yet
    // among the user's orgs and teams.
    if (pLabel) {
      const routeProgram = find(pById, p => p.label === pLabel);
      if (routeProgram) {
        programIds.add(routeProgram.uid);
      }
    }
    return pickBy(pById, p => programIds.has(p.uid));
  },
);

const program = createSelector(
  routing.routeProgramLabel,
  routing.routeProgramId,
  _programsById,
  team,
  organization,
  (pLabel, pId, pById = {}, t, o) => {
    if (pLabel && pId) {
      throw new Error("Can't have both programLabel and programId in params.");
    } else if (pLabel) {
      return find(pById, p => p.label === pLabel);
    } else if (pId) {
      return pById[pId];
    } else if (t) {
      return pById[t.program_id];
    } else if (o) {
      return pById[o.program_id];
    }
    return undefined;
  },
);

// A program entity has ProgramMetricConfigs (see services/triton/programs.ts),
// which specify metrics that are configurable, and whether they're on by
// default. This selector chooses the MetricEntity[] whose ids are mentioned
// in the program.
program.metrics = createSelector(
  program,
  metrics.list,
  (p = {}, ms = []) =>
    p.metrics
      ? ms.filter(metric =>
          p.metrics.map(mConf => mConf.uid).includes(metric.uid),
        )
      : [],
);

authUser.team = {};

authUser.team.isMember = createSelector(
  authUser,
  team,
  (u = { owned_teams: [] }, t = {}) => u.owned_teams.includes(t.uid),
);

authUser.team.isCaptain = createSelector(
  authUser,
  team,
  (u, t = {}) => (u ? u.uid === t.captain_id : false),
  // Need to check for authUser because it can be null and attempting
  // to access a property of null results in a TypeError.
  //
  // Not setting a default value for u because Jest and Browser behave
  // differently when null is passed in.
  //
  // Jest test: null parameter does NOT take on default parameter.
  //   (u = {}) if authUser is null, u is null
  // Browser: null parameter DOES take on default parameter.
  //   (u = {}) if authUser is null, u is {}
);

authUser.team.isContact = createSelector(
  authUser,
  team.classrooms.listProp('contact_id'),
  (u = {}, contactIds = []) => contactIds.includes(u.uid),
);

authUser.team.classrooms = createAnnotatedSelector(
  authUser,
  team.classrooms,
  (u = {}, cById = {}) => pickBy(cById, c => c.contact_id === u.uid),
);

authUser.team.participants = createAnnotatedSelector(
  authUser.team.classrooms.listProp('uid'),
  _participantsById,
  (cIds = [], pById = {}) =>
    pickBy(pById, p => p.classroom_ids.find(id => cIds.includes(id))),
);

// By virtue of what team-organization-user relationship(s) does the current
// user have supervisor permission? Return any org ids that apply.
authUser.team.organizationIds = createAnnotatedSelector(
  authUser,
  team,
  (
    u = { owned_organizations: [], networked_organizations: [] },
    t = { organization_ids: [] },
  ) =>
    t.organization_ids.filter(orgId => {
      const allOrgs = u.owned_organizations.concat(u.networked_organizations);
      return allOrgs.includes(orgId);
    }),
);

// Is logged in user an Organization Admin of the current Team?
// - Yes for any user that is a member of any organization the team is on.
authUser.team.isSupervisor = createSelector(
  authUser.team.organizationIds,
  (orgIds = []) => orgIds.length > 0,
);

authUser.organization = {};

// Is logged in user an Organization Admin?
// - Yes for any user that is a member of the organization
authUser.organization.isMember = createSelector(
  authUser,
  organization,
  (u = { owned_organizations: [] }, o = {}) =>
    u.owned_organizations.includes(o.uid),
);

authUser.classroom = {};

authUser.classroom.isContact = createSelector(
  authUser,
  classroom,
  (u = {}, c = {}) => u.uid === c.contact_id,
);

// Get teams for the authed user (not the one in the route or props).
authUser.teams = createAnnotatedSelector(
  authUser,
  authUser.isAdmin,
  _teamsById,
  (u = { owned_teams: [] }, isAdmin, tById = {}) =>
    isAdmin ? tById : pickBy(tById, t => u.owned_teams.includes(t.uid)),
);

// Get teams and orgs scoped to the current program.
authUser.recentProgram = createSelector(
  authUser,
  _programsById,
  (u = {}, pById = {}) => pById[u.recent_program_id],
);

authUser.program = {};

authUser.program.teams = createAnnotatedSelector(
  program,
  authUser.teams,
  (p = {}, tById = {}) => pickBy(tById, t => t.program_id === p.uid),
);

authUser.program.organizations = createAnnotatedSelector(
  program,
  authUser.organizations,
  (p = {}, oById = {}) => pickBy(oById, o => o.program_id === p.uid),
);

// Does user have Organization permissions?
// - Yes for Copilot Admins or Organization Admins
authUser.hasOrganizationPermission = createSelector(
  authUser.isAdmin,
  authUser.team.isSupervisor,
  (isAdmin, isSupervisor) => isAdmin || isSupervisor,
);

authUser.hasCaptainPermission = createSelector(
  authUser.isAdmin,
  authUser.team.isCaptain,
  authUser.team.isSupervisor,
  (isAdmin, isCaptain, isSupervisor) => isAdmin || isCaptain || isSupervisor,
);

// Reports
const reports = createAnnotatedSelector(_reportsById, r => r);

// Note: this doesn't follow the typical, expected, pattern. We are returning a
// custom object created by the reports reducer. We might want to clean this up
// later on.
reports.teams = createAnnotatedSelector(_reportsData, r => r.byTeam);

reports.team = createAnnotatedSelector(
  reports.teams,
  routing.routeTeamId,
  (reportsByTeam = {}, teamId) => reportsByTeam[teamId],
);

reports.team.teamReports = createAnnotatedSelector(
  reports.team,
  team,
  (reportsByWeek, t = {}) =>
    mapValues(reportsByWeek, week =>
      week
        // Filter reports without a classroom_id
        .filter(r => !r.classroom_id)
        // Add in display `name` for the report
        .map(r => ({ ...r, name: t.name }))
        // Sort by report name
        // https://stackoverflow.com/questions/2167602/optimum-way-to-compare-strings-in-javascript
        // https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript/16481400#16481400
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
);

reports.team.classroomReports = createAnnotatedSelector(
  team,
  reports.team,
  team.classrooms,
  program,
  (t = {}, reportsByWeek = {}, cById = {}, p = {}) =>
    mapValues(reportsByWeek, week =>
      week
        // Filter reports with a classroom_id
        .filter(r => r.classroom_id)
        // Filter out reports without an associated classroom
        .filter(r => cById[r.classroom_id])
        // Add in the display `name` for the report
        .map(r => ({
          ...r,
          name: p.use_classrooms ? cById[r.classroom_id].name : t.name,
        }))
        // Sort by report name
        // https://stackoverflow.com/questions/2167602/optimum-way-to-compare-strings-in-javascript
        // https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript/16481400#16481400
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
);

reports.team.classroomReports.allowed = createAnnotatedSelector(
  reports.team.classroomReports,
  authUser.isAdmin,
  authUser.team.classrooms.list,
  (reportsByWeek, userIsAdmin, authUserClassroomsList) => {
    // super_admins can view all reports.
    if (userIsAdmin) {
      return reportsByWeek;
    }

    // non-super_admins can only view reports associated with classrooms where
    // they are the main contact.
    const classroomIds = authUserClassroomsList.map(c => c.uid);

    return mapValues(reportsByWeek, week =>
      week.filter(r => classroomIds.includes(r.classroom_id)),
    );
  },
);

reports.team.classroomReports.allowed.visible = createAnnotatedSelector(
  reports.team.teamReports,
  reports.team.classroomReports.allowed,
  (teamReports, classroomReports) => {
    const reportsByWeek = mapValues(teamReports, (_, week) =>
      // Concat team and classroom-level reports.
      // Team-level reports appear first.
      teamReports[week].concat(classroomReports[week]),
    );

    // Remove any empty weeks from the final reportsByWeek
    const finalReportsByWeek = {};

    forOwn(reportsByWeek, (weekReports, week) => {
      if (weekReports.length) {
        finalReportsByWeek[week] = weekReports;
      }
    });

    return finalReportsByWeek;
  },
);

reports.organization = createAnnotatedSelector(
  reports,
  routing.routeOrganizationId,
  (rById, orgId) => pickBy(rById, r => r.parent_id === orgId),
);

const dashboard = createSelector(
  _dashboardData,
  x => x,
);

dashboard.options = createSelector(
  dashboard,
  dboard => {
    const teamOptions = uniq(map(dboard, d => `team:${d.team}`));
    const stepOptions = uniq(map(dboard, d => `stage:${d.stage}`));
    const taskOptions = uniq(map(dboard, d => `task:${d.task}`));

    return [
      ['', 'All Tasks'],
      ...teamOptions.map(o => [o, o]),
      ...stepOptions.map(o => [o, o]),
      ...taskOptions.map(o => [o, o]),
      ['status:Complete', 'status:Complete'],
      ['status:Incomplete', 'status:Incomplete'],
    ];
  },
);

dashboard.search = createSelector(
  // make sure the connected component is receiving the `form` prop
  form.values,
  formValues => {
    const searchString = formValues && formValues.search;
    if (searchString && searchString.indexOf(':') !== -1) {
      const [searchBy, searchPhrase] = searchString.split(':');
      return {
        searchBy: searchBy.trim().toLowerCase(),
        searchPhrase: searchPhrase.trim().toLowerCase(),
      };
    }

    const searchBy = false;
    const searchPhrase = false;
    return { searchBy, searchPhrase };
  },
);

dashboard.search.by = createSelector(
  dashboard.search,
  searchString => {
    const { searchBy } = searchString;
    return searchBy;
  },
);

dashboard.search.phrase = createSelector(
  dashboard.search,
  searchString => {
    const { searchPhrase } = searchString;
    return searchPhrase;
  },
);

dashboard.filtered = createSelector(
  dashboard,
  dashboard.search.by,
  dashboard.search.phrase,
  (dboard = {}, searchBy, searchPhrase) => {
    if (isEmpty(dboard) || !searchBy || !searchPhrase) {
      return dboard;
    }

    // https://github.com/sindresorhus/escape-string-regexp
    const escapedSearchPhrase = escapeStringRegexp(searchPhrase);
    // Only allow matches on word boundries. This allows `complete` to match
    // without also catching `incomplete`.
    const searchRegex = new RegExp(`\\b${escapedSearchPhrase}`);

    return filter(
      dboard,
      d => d && d[searchBy] && searchRegex.test(d[searchBy].toLowerCase()),
    );
  },
);

const dashboardTeamsPerPage = 10;

// Total number of pages available on organization dashboard.
dashboard.totalPages = createSelector(
  organization.teams.list,
  orgTeamsList =>
    orgTeamsList ? Math.ceil(orgTeamsList.length / dashboardTeamsPerPage) : 0,
);

// Array of Team UIDs to display in organization dashboard.
dashboard.teamIdsToDisplay = createSelector(
  organization.teams.list,
  form.values,
  (orgTeamsList, formValues) => {
    const showIndex = formValues.page ? formValues.page - 1 : 0;
    const showFrom = showIndex * dashboardTeamsPerPage;
    const showTo = showFrom + dashboardTeamsPerPage;
    const teamsToDisplay = orgTeamsList.slice(showFrom, showTo);
    const teamIdsToDisplay = teamsToDisplay.map(t => t.uid);
    return teamIdsToDisplay;
  },
);

const digests = createAnnotatedSelector(_digestsById, d => d);

// override `.list` with custom sort by `.created`
digests.list = createSelector(
  digests,
  (d = {}) => values(d).sort((a, b) => (a.created > b.created ? 1 : -1)),
);

// Search and Email Selected

const emailTemplates = createAnnotatedSelector(
  _emailTemplates,
  slice => slice.byId,
);

emailTemplates.bySlug = createAnnotatedSelector(emailTemplates, tById =>
  keyBy(tById, 'slug'),
);

/**
 * Form values selector for the search page, where you can check result items.
 * @param  {Object} state redux state
 * @param  {Object} props component props
 * @return {Object}       as {uid: boolean} where true means selected
 */
const search = {};

search.form = (state, props) => props.searchForm;

search.form.values = (state, props) =>
  getFormValues(props.searchForm)(state, props);

search.selected = createSelector(
  search.form.values,
  (selected = {}) => Object.keys(pickBy(selected, Boolean)),
);

search.selected.teams = createAnnotatedSelector(
  search.selected,
  _teamsById,
  (ids = [], tById = {}) =>
    pick(tById, ids.filter(id => getKind(id) === 'Team')),
);

search.selected.classrooms = createAnnotatedSelector(
  search.selected,
  _classroomsById,
  (ids = [], cById = {}) =>
    pick(cById, ids.filter(id => getKind(id) === 'Classroom')),
);

search.selected.organizations = createAnnotatedSelector(
  search.selected,
  _organizationsById,
  (ids = [], oById = {}) =>
    pick(oById, ids.filter(id => getKind(id) === 'Organization')),
);

search.selected.users = createAnnotatedSelector(
  search.selected,
  _usersById,
  (ids = [], uById = {}) =>
    pick(uById, ids.filter(id => getKind(id) === 'User')),
);

/**
 * Users associated with selected teams. These users do NOT need to be among
 * those selected on the search page.
 * @param  {Object} state   the whole redux state, not a slice
 * @param  {Object} props   props
 * @return {Object}         Unique collection of users, indexed by uid.
 */
search.selected.associatedTeamMembers = createAnnotatedSelector(
  state => state,
  search.selected.teams.list,
  (s = {}, ts = []) =>
    // team.users is the selector!
    Object.assign({}, ...ts.map(t => team.users(s, { teamId: t.uid }))),
);

search.selected.associatedCaptains = createAnnotatedSelector(
  state => state,
  search.selected.teams.list,
  (s = {}, ts = []) =>
    keyBy(
      // Filter any `undefined` entries in the list of captains, which might
      // happen if that user isn't in the store.
      ts.map(t => team.captain(s, { teamId: t.uid })).filter(Boolean),
      'uid',
    ),
);

search.selected.associatedContacts = createAnnotatedSelector(
  state => state,
  search.selected.classrooms.list,
  (s = {}, cs = []) =>
    keyBy(
      cs.map(c => classroom.contact(s, { classroomId: c.uid })).filter(Boolean),
      'uid',
    ),
);

search.selected.associatedAdmins = createAnnotatedSelector(
  state => state,
  search.selected.organizations.list,
  (s = {}, os = []) =>
    Object.assign(
      {},
      ...os.map(o => organization.users(s, { organizationId: o.uid })),
    ),
);

search.selected.recipients = createAnnotatedSelector(
  search.selected.users,
  search.selected.associatedCaptains,
  search.selected.associatedTeamMembers,
  search.selected.associatedContacts,
  search.selected.associatedAdmins,
  (selUsers, captains, teamMembers, contacts, admins) =>
    Object.assign({}, selUsers, teamMembers, captains, contacts, admins),
);

// UI
const _uiFlashById = state => state.ui.flash;

const flashKeyFromProps = (_, props = {}) => props.flashKey || null;

const flashMessage = createSelector(
  _uiFlashById,
  flashKeyFromProps,
  (flash, key) => flash[key] || null,
);

const exportedSelectors = {
  error,
  loading,
  adding,
  updating,
  deleting,
  redirect,
  form,
  auth,
  authUser,
  classrooms,
  classroom,
  cycle,
  digests,
  emailTemplates,
  links,
  metrics,
  organizations,
  organization,
  programs,
  program,
  reports,
  responses,
  search,
  teams,
  team,
  users,
  user,
  dashboard,
  flashMessage,
};

export default exportedSelectors;
