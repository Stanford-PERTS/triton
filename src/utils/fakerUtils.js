import faker from 'faker';
import moment from 'moment';
import keyBy from 'lodash/keyBy';

import mocks from 'mocks';

export const arrayToString = (array = []) => JSON.stringify(array.map(String));

/**
 * Utility Functions
 */

// Generate UIDs
const uids = [];

export const generateUid = (type = '') => {
  const uid = faker.random
    .uuid()
    .split('-')
    .pop();
  return `${type}_${uid}`;
};

export const generateUniqueId = (type = '') => {
  let uid = generateUid(type);

  while (uid in uids) {
    uid = generateUid(type);
  }

  uids[uid] = true;

  return uid;
};

export const generateShortUid = (uid = '') => uid.split('_').pop();

// Capitalize. Upper case the first character of a given string.
export const capitalize = (word = '') =>
  word.charAt(0).toUpperCase() + word.slice(1);

// Return a random integer between min and max.
export const randomIntegerBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const randomSample = (arr, sampleLen) => {
  const sample = [...arr];
  const out = [];
  for (let x = 0; x < Math.min(arr.length, sampleLen); x += 1) {
    const i = randomIntegerBetween(0, sample.length - 1);
    out.push(sample.splice(i, 1)[0]);
  }
  return out;
};

export const randomTopic = () =>
  ['Art', 'Computing', 'English', 'Math', 'Science'][
    randomIntegerBetween(0, 4)
  ];

// Return a random school type string, 'University' or 'College'.
export const randomSchoolType = () =>
  ['University', 'Uni', 'College', 'High School', 'High', 'Middle School'][
    // Math.round(Math.random())
    randomIntegerBetween(0, 5)
  ];

/**
 * @param  {number} earliestWeek: how many weeks from today is the earliest in
 *     the range we can pick from? 0 means last monday, -1 means the monday
 *     before that, 1 means next monday.
 * @param  {number} latestWeek:   how many weeks from today is the latest monday
 *     we can pick from.
 * @return {Date}:                Monday (local) a random number of weeks now.
 */
export const randomMonday = (earliestWeek, latestWeek) => {
  let monday = new Date();
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;
  while (monday.getDay() !== 1) {
    monday = new Date(Number(monday) - day);
  }
  const weekInterval = randomIntegerBetween(earliestWeek, latestWeek);
  monday = new Date(Number(monday) + weekInterval * week);

  // Zero time portion.
  monday.setHours(0);
  monday.setMinutes(0);
  monday.setSeconds(0);
  monday.setMilliseconds(0);

  return monday;
};

// Shuffle an array, mutates
function shuffle(array = []) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    const index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter -= 1;

    // And swap the last element with it
    const temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

/**
 * Copilot data generating functions
 */

export const generatePrograms = allMetrics => {
  const ep19 = {
    uid: generateUniqueId('Program'),
    name: 'The Engagement Project',
    label: 'ep19',
    metrics: JSON.stringify([
      { uid: 'Metric_teacher-caring', default_active: true },
      { uid: 'Metric_feedback-for-growth', default_active: true },
      { uid: 'Metric_meaningful-work', default_active: true },
      { uid: 'Metric_cultural-competence', default_active: false },
    ]),
    survey_config_enabled: true,
    // target_group_enabled, // default is true
    // max_cycles, // default is -1
    min_cycles: 3,
    min_cycle_weekdays: 10,
    // send_cycle_email, // default is true
    // max_team_members, // default is -1
    // Copilot OFFICIAL 2019-2020
    preview_url: 'https://sshs.qualtrics.com/jfe/form/SV_7VhdOnQLdNXw81D',
    active: true,
  };
  ep19.short_uid = generateShortUid(ep19.uid);

  const belesetLabel = 'beleset19';
  const beleset19 = {
    uid: generateUniqueId('Program'),
    name: 'Copilot-Elevate',
    label: belesetLabel,
    metrics: JSON.stringify([
      { uid: 'Metric_student-voice', default_active: true },
      { uid: 'Metric_classroom-belonging', default_active: true },
      { uid: 'Metric_teacher-caring', default_active: true },
      { uid: 'Metric_feedback-for-growth', default_active: true },
      { uid: 'Metric_meaningful-work', default_active: true },
      { uid: 'Metric_cultural-competence', default_active: false },
    ]),
    survey_config_enabled: true,
    // target_group_enabled, // default is true
    // max_cycles, // default is -1
    min_cycles: 2,
    min_cycle_weekdays: 5,
    send_cycle_email: false,
    // max_team_members, // default is -1
    team_term: 'Project',
    classroom_term: 'Roster',
    captain_term: 'Host',
    // contact_term, // default is 'Main Contact'
    member_term: 'Member',
    preview_url: `https://saturn.perts.net/surveys/${belesetLabel}`,
    active: true,
  };
  beleset19.short_uid = generateShortUid(beleset19.uid);

  const csetLabel = 'cset19';
  const cset19 = {
    uid: generateUniqueId('Program'),
    name: 'C-SET',
    label: csetLabel,
    metrics: JSON.stringify([
      { uid: 'Metric_identity-threat', default_active: true },
      { uid: 'Metric_institutional-gms', default_active: true },
      { uid: 'Metric_stem-efficacy', default_active: true },
      { uid: 'Metric_social-belonging', default_active: true },
      { uid: 'Metric_trust-fairness', default_active: true },
    ]),
    survey_config_enabled: false,
    target_group_enabled: false,
    max_cycles: 8,
    min_cycles: 3,
    min_cycle_weekdays: 5,
    send_cycle_email: false,
    // max_team_members, // default is -1
    team_term: 'Project',
    classroom_term: 'Roster',
    captain_term: 'Lead',
    // contact_term, // default is 'Main Contact'
    member_term: 'Member',
    preview_url: `https://saturn.perts.net/surveys/${csetLabel}`,
    active: true,
  };
  cset19.short_uid = generateShortUid(cset19.uid);

  const mset19 = mocks.createProgram({
    name: 'Message IT',
    label: 'mset19',
    metrics: JSON.stringify([
      { uid: 'Metric_social-belonging-message', default_active: true },
      { uid: 'Metric_identity-safety-message', default_active: true },
      { uid: 'Metric_trust-fairness-message', default_active: true },
      {
        uid: 'Metric_institutional-gms-message',
        default_active: true,
      },
      { uid: 'Metric_stem-efficacy-message', default_active: true },
      { uid: 'Metric_bureaucratic-hassles-message', default_active: true },
    ]),
    // survey_config_enabled: true by default
    target_group_enabled: false,
    use_cycles: false,
    use_classrooms: false,
    max_cycles: 1,
    min_cycles: 1,
    // min_cycle_weekdays not applicable
    send_cycle_email: false,
    // max_team_members: -1 by default
    team_term: 'Artifact',
    // classroom_term not applicable
    captain_term: 'Lead',
    // contact_term: 'Main Contact' by default
    member_term: 'Educator',
    organization_term: 'Collection',
    preview_url: `https://saturn.perts.net/surveys/mset19`,
  });

  return [ep19, beleset19, cset19, mset19];
};

export const generateUsers = num => {
  const users = [];

  for (let i = 0; i < num; i += 1) {
    const uid = generateUniqueId('User');
    const short_uid = generateShortUid(uid);
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const name = `${firstName} ${lastName}`;
    const email = `${name.replace(/ /g, '_').toLowerCase()}@example.com`;

    users.push({
      uid,
      short_uid,
      name,
      email,
      user_type: 'user',
      owned_teams: [],
      owned_organizations: [],
    });
  }
  return users;
};

export const generateUser = () => generateUsers(1).pop();

export const generateAdminUser = (users = []) => {
  users.push({
    uid: 'User_admin',
    short_uid: 'admin',
    email: 'admin@perts.net',
    user_type: 'super_admin',
    owned_teams: [],
    owned_organizations: [],
  });
};

export const generateTeams = (programs, num) => {
  // Only assign teams to active programs.
  const programIds = programs.filter(p => p.active).map(p => p.uid);
  const teams = [];

  for (let i = 0; i < num; i += 1) {
    const uid = generateUniqueId('Team');
    const short_uid = generateShortUid(uid);
    const name = `${capitalize(faker.address.city())} ${randomSchoolType()}`;
    const [program_id] = randomSample(programIds, 1);

    teams.push({
      uid,
      short_uid,
      name,
      survey_reminders: 0, // send survey reminders?
      report_reminders: 0, // send report reminders?
      captain_id: '',
      organization_ids: [],
      program_id,
      // This default is enforced by server code, not the database itself, so
      // we have to re-create that here.
      task_data: {},
    });
  }
  return teams;
};

export const generateTeam = () => generateTeams(1).pop();

export const associateUsersWithTeams = (users = [], teams = []) => {
  // select random users for each team
  // the first user selected for each team will be the captain
  teams.forEach(team => {
    const numOfUsers = randomIntegerBetween(2, 5);
    users = shuffle(users);

    // captain
    users[0].owned_teams.push(team.uid);
    team.captain_id = users[0].uid;

    // other users
    users.slice(1, numOfUsers).forEach(user => {
      user.owned_teams.push(team.uid);
    });
  });
};

export const generateOrganizations = (programs, num) => {
  const organizations = [];
  // All orgs get a program. Randomly select from among active programs.
  const programIds = programs.filter(p => p.active).map(p => p.uid);

  for (let i = 0; i < num; i += 1) {
    organizations.push(
      mocks.createOrganization({
        program_id: programIds[randomIntegerBetween(0, programIds.length - 1)],
      }),
    );
  }

  return organizations;
};

export const generateParticipantsForTeam = (team, classrooms) => {
  // Generate some number of participants, without classrooms.
  const numInTeam = randomIntegerBetween(8, 20);
  const participants = Array.from({ length: numInTeam }).map(_ =>
    mocks.createParticipant({ team_id: team.uid, classroom_ids: [] }),
  );

  // For each classroom
  for (const cl of classrooms) {
    // Assign a random sample of participants to this classroom.
    const numInClassroom = randomIntegerBetween(0, numInTeam);
    const sample = randomSample(participants, numInClassroom);
    for (const ppt of sample) {
      ppt.classroom_ids.push(cl.uid);
    }
  }

  return participants;
};

export const generateParticipants = (teams, classrooms) => {
  let allParticipants = [];
  for (const team of teams) {
    const teamClassrooms = classrooms.filter(c => c.team_id === team.uid);
    const teamParticipants = generateParticipantsForTeam(team, teamClassrooms);
    allParticipants = allParticipants.concat(teamParticipants);
  }

  return allParticipants;
};

export const associateTeamsWithOrganizations = (teams = [], orgs = []) => {
  // select random organization for each team (on same program)
  teams.forEach(team => {
    const pOrgs = shuffle(orgs.filter(o => o.program_id === team.program_id));

    if (pOrgs.length > 0) {
      team.organization_ids.push(pOrgs[0].uid);
    }
  });
};

export const associateUsersWithOrganizations = (
  users = [],
  organizations = [],
) => {
  // select random users for to be admins for each organization
  organizations.forEach(organization => {
    const numOfUsers = randomIntegerBetween(1, 3);
    users = shuffle(users);

    users.slice(0, numOfUsers).forEach(user => {
      user.owned_organizations.push(organization.uid);
    });
  });
};

export const getTeachersOnTeam = (users = [], team = []) =>
  users.filter(user => user.owned_teams.includes(team.uid));

export const generateClassroom = (user = {}, team = {}) => {
  const uid = generateUniqueId('Classroom');
  const short_uid = generateShortUid(uid);

  return {
    uid,
    short_uid,
    name: `${randomTopic()} - Period ${randomIntegerBetween(1, 6)}`,
    code: `${faker.lorem.word()} ${faker.lorem.word()}`,
    contact_id: user.uid || generateUniqueId('User'),
    team_id: team.uid || generateUniqueId('Team'),
    num_students: randomIntegerBetween(10, 20),
    // not verifying that these match what would appropriate for school type
    grade_level: randomIntegerBetween(1, 12),
  };
};

export const generateClassrooms = (users = [], teams = []) => {
  const classrooms = [];
  // generate a random number of classrooms per team
  // at least one classroom per teacher on the team
  teams.forEach(team => {
    const teamUsers = getTeachersOnTeam(users, team);
    teamUsers.forEach(user => {
      const numOfClassrooms = randomIntegerBetween(2, 4);
      for (let i = 0; i < numOfClassrooms; i += 1) {
        classrooms.push(generateClassroom(user, team));
      }
    });
  });
  return classrooms;
};

export const generateMetrics = () => {
  const metrics = [];

  const metricConfig = [
    {
      name: 'Teacher Caring',
      label: 'teacher-caring',
      description:
        'Students engage more deeply in their work when they feel like their ' +
        'teacher likes them and cares about them.',
      url: 'https://perts.net/conditions-teacher-caring',
    },
    {
      name: 'Feedback for Growth',
      label: 'feedback-for-growth',
      description:
        'Students learn more effectively when their teachers recognize and ' +
        'encourage progress and offer supportive, respectful critical ' +
        'feedback to help students improve.',
      url: 'https://perts.net/conditions-feedback-for-growth',
    },
    {
      name: 'Meaningful Work',
      label: 'meaningful-work',
      description:
        'Students are more motivated to learn when they see how class ' +
        'material relates to their lives outside of school.',
      url: 'https://perts.net/conditions-meaningful-work',
    },
    {
      name: 'Social Belonging',
      label: 'social-belonging',
      description: '',
      url: 'https://perts.net/conditions-social-belonging',
    },
    {
      name: 'Classroom Belonging',
      label: 'classroom-belonging',
      description: '',
      url: 'https://perts.net/conditions-classroom-belonging',
    },
    {
      name: 'Cultural Competence',
      label: 'cultural-competence',
      description: '',
      url: 'https://perts.net/conditions-cultural-competence',
    },
    {
      name: 'Identity Threat',
      label: 'identity-threat',
      description: '',
      url: 'https://perts.net/conditions-identity-threat',
    },
    {
      name: 'Institutional Growth Mindset',
      label: 'institutional-gms',
      description: '',
      url: 'https://perts.net/conditions-institutional-gms',
    },
    {
      name: 'STEM Efficacy',
      label: 'stem-efficacy',
      description: '',
      url: 'https://perts.net/conditions-stem-efficacy',
    },
    {
      name: 'Student Voice',
      label: 'student-voice',
      description: '',
      url: 'https://perts.net/conditions-student-voice',
    },
    {
      name: 'Trust and Fairness',
      label: 'trust-fairness',
      description: '',
      url: 'https://perts.net/conditions-trust-fairness',
    },
    {
      name: 'Social Belonging',
      label: 'social-belonging-message',
      description: '',
      url: 'https://perts.net/conditions-social-belonging-message',
    },
    {
      name: 'Identity Safety',
      label: 'identity-safety-message',
      description: '',
      url: 'https://perts.net/conditions-identity-safety-message',
    },
    {
      name: 'Trust and Fairness',
      label: 'trust-fairness-message',
      description: '',
      url: 'https://perts.net/conditions-trust-fairness-message',
    },
    {
      name: 'Institutional Growth Mindset',
      label: 'institutional-gms-message',
      description: '',
      url: 'https://perts.net/conditions-institutional-gms-message',
    },
    {
      name: 'STEM Efficacy',
      label: 'stem-efficacy-message',
      description: '',
      url: 'https://perts.net/conditions-stem-efficacy-message',
    },
    {
      name: 'Bureaucratic Hassles',
      label: 'bureaucratic-hassles-message',
      description: '',
      url: 'https://perts.net/conditions-bureaucratic-hassles-message',
    },
  ];

  metricConfig.forEach(m => {
    const uid = `Metric_${m.label}`;
    const short_uid = m.label;
    const links = [
      {
        type: 'reading',
        text: m.name,
        url: m.url,
      },
    ];

    metrics.push({
      uid,
      short_uid,
      name: m.name,
      label: m.label,
      description: m.description,
      links,
    });
  });

  return metrics;
};

// generate one survey per team
export const generateSurvey = (team, metricConfigs = []) => {
  const uid = generateUniqueId('Survey');
  const short_uid = generateShortUid(uid);
  const activeMetricIds = metricConfigs
    .filter(mc => mc.default_active)
    .map(mc => mc.uid);

  return {
    uid,
    short_uid,
    team_id: team.uid,
    metrics: arrayToString(activeMetricIds),
    open_responses: arrayToString(activeMetricIds),
    meta: {},
  };
};

export const generateSurveys = (teams = [], programs = [], metrics = []) => {
  const programIndex = keyBy(programs, 'uid');
  return teams.map(t => {
    if (t.program_id) {
      const program = programIndex[t.program_id];
      return generateSurvey(t, JSON.parse(program.metrics));
    }
    return generateSurvey(t, metrics.map(m => m.uid));
  });
};

export const generateFileReport = (org_id, team_id, classroom_id) => {
  const uid = generateUniqueId('Report');
  const [, short_uid] = uid.split('_');

  const filename = Math.random() > 0.5 ? '2017-07-31.pdf' : '2017-08-07.pdf';
  const gcs_path = `/some/file/path/${filename}`;
  const size = faker.random.number();
  const content_type = 'application/pdf';

  return {
    uid,
    short_uid,
    parent_id: classroom_id || team_id || org_id,
    org_id,
    team_id,
    classroom_id,
    filename,
    gcs_path,
    size,
    content_type,
  };
};

export const generateDatasetReport = (
  organization_id,
  team_id,
  classroom_id,
) => {
  const uid = generateUniqueId('Report');
  const [, short_uid] = uid.split('_');

  const issue_date = moment(randomMonday(-4, 0)).format('YYYY-MM-DD');
  const filename = `${issue_date}.html`;
  // const gcs_path = `/some/file/path/${filename}`;
  // const size = faker.random.number();
  const template = 'passthrough';
  const dataset_id = 'Dataset_foo';
  const content_type = 'text/html';

  return {
    uid,
    short_uid,
    parent_id: classroom_id || team_id || organization_id,
    organization_id,
    team_id,
    classroom_id,
    filename,
    issue_date,
    template,
    dataset_id,
    content_type,
  };
};

export const generateReports = (organizations, classrooms) => {
  organizations = organizations || [];
  classrooms = classrooms || [];
  const reports = [];

  // Add classroom level reports
  classrooms.forEach(classroom => {
    reports.push(generateDatasetReport(null, classroom.team_id, classroom.uid));
  });

  // Add team level reports
  const teams = {};

  classrooms.forEach(classroom => {
    if (!teams[classroom.team_id]) {
      reports.push(generateDatasetReport(null, classroom.team_id, null));
      teams[classroom.team_id] = true;
    }
  });

  // Add org level reports
  organizations.forEach(org => {
    reports.push(generateDatasetReport(org.uid, null, null));
  });

  return reports;
};

export const generateCycle = (team_id, ordinal, start_date, end_date) => {
  const uid = generateUniqueId('Cycle');
  const [, short_uid] = uid.split('_');
  const meeting_datetime = moment(end_date)
    .hour(10)
    .minute(0)
    .second(0);
  const meeting_location = `${capitalize(
    faker.name.lastName(),
  )} Hall, Room ${randomIntegerBetween(1, 350)}`;

  return {
    uid,
    short_uid,
    team_id,
    ordinal,
    start_date,
    end_date,
    meeting_datetime,
    meeting_location,
  };
};

export const generateCyclesForTeam = (team, program) => {
  /* eslint complexity: "off" */
  const cycles = [];

  const max = (program ? program.max_cycles : 10) || 10;
  const min = (program ? program.min_cycles : 2) || 2;

  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;
  const numCycles = randomIntegerBetween(min, max);
  const originalDate = randomMonday(-8, 0);
  const cycleLength = 4 * week;

  // Randomly allow some cycles not to be scheduled, initially
  const numScheduled = randomIntegerBetween(2, numCycles);

  let currentStart = originalDate;
  let currentEnd;
  for (let x = 0; x < numCycles; x += 1) {
    if (x < numScheduled) {
      currentStart = new Date(Number(currentStart) + x * cycleLength);
      // -3 days to end on a Fri, not Mon
      currentEnd = new Date(Number(currentStart) + cycleLength - 3 * day);
    } else {
      currentStart = currentEnd = undefined;
    }
    cycles.push(generateCycle(team.uid, x + 1, currentStart, currentEnd));
  }

  return cycles;
};

export const generateResponse = (user_id, team_id, parent_id) => {
  const uid = generateUniqueId('Response');
  const [, short_uid] = uid.split('_');
  const progress = randomIntegerBetween(0, 2) * 50;
  let body = null;
  if (progress > 0) {
    const modified = moment()
      .utc()
      .format();
    body = {
      height: { value: randomIntegerBetween(150, 200), modified },
      karma: { value: randomIntegerBetween(1, 7), modified },
      opinion: { value: faker.lorem.paragraph(), modified },
    };
  }

  const type = user_id ? 'User' : 'Team';

  return {
    uid,
    short_uid,
    type,
    user_id,
    team_id,
    parent_id,
    module_label: 'EPPracticeJournal',
    progress,
    body: JSON.stringify(body),
  };
};

export const generateResponsesForTeam = (cycles, users) => {
  const responseRate = 0.5;
  const today = new Date();

  const responses = [];
  cycles.forEach(c => {
    // Only respond to present and past cycles.
    if (c.start_date > today) {
      users.forEach(u => {
        // Nobody's perfect
        if (Math.random() < responseRate) {
          responses.push(generateResponse(u.uid, c.team_id, c.uid));
        }
      });
    }
  });

  return responses;
};
