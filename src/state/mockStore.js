import keyBy from 'utils/keyBy';
import { configureStore } from './store';

import {
  // generateSurveys,
  associateUsersWithTeams,
  generateAdminUser,
  generateClassrooms,
  generateMetrics,
  generatePrograms,
  generateReports,
  generateTeams,
  generateUsers,
} from 'utils/fakerUtils';

const metrics = generateMetrics(6);
const programs = generatePrograms(metrics);
const users = generateUsers(20);
const teams = generateTeams(programs, 10);
associateUsersWithTeams(users, teams);
generateAdminUser(users);
const classrooms = generateClassrooms(users, teams);
const reports = generateReports(classrooms);

const usersById = keyBy(users, 'uid');
const admin = usersById.User_admin;

// Note that this does NOT mock surveys, currently.
const initialState = {
  entities: {
    classrooms: {
      byId: keyBy(classrooms, 'uid'),
    },
    metrics: {
      byId: keyBy(metrics, 'uid'),
    },
    programs: {
      byId: keyBy(programs, 'uid'),
    },
    reports: {
      byId: keyBy(reports, 'uid'),
    },
    teams: {
      byId: keyBy(teams, 'uid'),
    },
    users: {
      byId: keyBy(users, 'uid'),
    },
  },
};

const mockStore = (user = admin) =>
  configureStore({
    ...initialState,
    auth: {
      user,
    },
  });

export default mockStore;
