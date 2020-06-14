import capitalize from 'capitalize';
import faker from 'faker';
import moment from 'moment';
import random from 'lodash/random';

import cy from 'mocks/cypress';
import createProgram from './createProgram';
import stripToken from 'utils/stripToken';

const schoolTypes = [
  'University',
  'College',
  'High School',
  'Middle School',
  'Elementary',
];

const classroomTypes = [
  'Geography',
  'Geology',
  'Geometry',
  'Geoengineering',
  'Geodesics',
];

const randomSchoolType = () => schoolTypes[random(0, schoolTypes.length - 1)];

const randomClassroomType = () =>
  classroomTypes[random(0, classroomTypes.length - 1)];

const entityType = uid => uid.split('_')[0];

const createUid = (type = '') => {
  const uid = faker.random
    .uuid()
    .replace(/-/g, '')
    .substr(1, 12);

  return `${capitalize(type)}_${uid}`;
};

const shortUid = uid => uid.split('_')[1];

const createSurvey = options => {
  const uid = createUid('Survey');
  const short_uid = shortUid(uid);
  const codes = [];
  const interval = 2;
  const metric_labels = {
    Metric_001: 'teacher-caring',
    Metric_002: 'feedback-for-growth',
    Metric_003: 'meaningful-work',
  };
  const metrics = ['Metric_001', 'Metric_002', 'Metric_003'];
  const open_responses = ['Metric_001', 'Metric_002', 'Metric_003'];
  const team_id = null;

  const survey = {
    uid,
    short_uid,
    codes,
    interval,
    metric_labels,
    metrics,
    open_responses,
    team_id,
    ...options,
  };

  return survey;
};

const createUser = options => {
  const uid = createUid('user');
  const short_uid = shortUid(uid);
  const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
  const email = name.replace(' ', '.').concat('@school.edu');
  const user_type = 'user';
  const owned_teams = [];
  const owned_organizations = [];
  const owned_networks = [];
  const receive_email = true;
  const receive_sms = true;

  const user = {
    uid,
    short_uid,
    name,
    email,
    user_type,
    owned_teams,
    owned_organizations,
    owned_networks,
    receive_email,
    receive_sms,
    ...options,
  };

  return user;
};

const createNetwork = options => {
  const uid = createUid('Network');
  const short_uid = shortUid(uid);
  const code = `${faker.lorem.word()} ${faker.lorem.word()}`;
  const name = `${faker.hacker.abbreviation()} ${capitalize(
    faker.name.jobType(),
  ).concat('s')} Net`;

  const network = {
    uid,
    short_uid,
    code,
    name,
    program_id: createUid('Program'),
    ...options,
  };

  return network;
};

const createOrganization = options => {
  const uid = createUid('Organization');
  const short_uid = shortUid(uid);
  const code = `${faker.lorem.word()} ${faker.lorem.word()}`;
  const name = `${faker.hacker.abbreviation()} ${capitalize(
    faker.name.jobType(),
  ).concat('s')}`;
  const phone_number = faker.phone.phoneNumber();
  const faddr = faker.address;
  const mailing_address = [
    `${faddr.streetAddress()}`,
    `${faddr.city()},${faddr.state()} ${faddr.zipCode()}`,
  ].join('\n');

  const org = {
    uid,
    short_uid,
    code,
    name,
    phone_number,
    mailing_address,
    program_id: createUid('Program'),
    ...options,
  };

  return org;
};

const createTeam = options => {
  const uid = createUid('team');
  const short_uid = shortUid(uid);
  const name = `${faker.name.lastName()} ${randomSchoolType()}`;
  const captain_id = '';
  const organization_ids = [];
  const program_id = '';
  const survey_reminders = false;
  const report_reminders = false;
  const target_group_name = '';
  const task_data = {};

  const team = {
    uid,
    short_uid,
    name,
    captain_id,
    organization_ids,
    program_id,
    survey_reminders,
    report_reminders,
    target_group_name,
    // team level task completion data
    task_data,
    ...options,
  };

  return team;
};

const createClassroom = options => {
  const uid = createUid('Classroom');
  return {
    uid,
    short_uid: shortUid(uid),
    name: `${faker.name.lastName()} ${randomClassroomType()}`,
    team_id: 'Team_foo',
    code: `${faker.lorem.words(2)}`,
    contact_id: 'User_contact',
    num_students: 0,
    grade_level: 9,
    ...options,
  };
};

const createParticipant = options => {
  const uid = createUid('Participant');
  const short_uid = shortUid(uid);
  const student_id = `student${short_uid}`;
  return {
    uid,
    short_uid,
    team_id: createUid('Team'),
    classroom_ids: [],
    student_id,
    stripped_student_id: stripToken(student_id),
    ...options,
  };
};

const createCycle = options => {
  const uid = createUid('cycle');
  const fromToday = intervalSeconds =>
    moment(Number(new Date()) + intervalSeconds * 1000).toISOString();
  return {
    uid,
    short_uid: shortUid(uid),
    team_id: 'Team_foo',
    ordinal: 1,
    start_date: fromToday(-24 * 60 * 60 * 1000),
    end_date: fromToday(24 * 60 * 60 * 1000),
    ...options,
  };
};

const setUserSuperAdmin = user => {
  user.user_type = 'super_admin';
};

const setUserCaptain = (user, team) => {
  team.captain_id = user.uid;
  join(user, team);
};

const join = (user, entity) => {
  if (entityType(entity.uid) === 'Team') {
    if (!user.owned_teams.includes(entity.uid)) {
      user.owned_teams.push(entity.uid);
    }
    entity.num_users += 1;
  }

  if (entityType(entity.uid) === 'Organization') {
    if (!user.owned_organizations.includes(entity.uid)) {
      user.owned_organizations.push(entity.uid);
    }
  }
};

export default {
  cy, // cypress related mocks
  createUid,
  createProgram,
  createSurvey,
  createUser,
  createNetwork,
  createOrganization,
  createTeam,
  createClassroom,
  createParticipant,
  createCycle,
  setUserSuperAdmin,
  setUserCaptain,
  shortUid,
  join,
};
