import selectors from 'state/selectors';
import mocks from 'mocks';
import merge from 'lodash/merge';
import { generateDatasetReport } from 'utils/fakerUtils';

import store from 'state/store';
const initialState = store.getState();

describe('auth', () => {
  describe('user', () => {
    describe('team', () => {
      describe('isCaptain', () => {
        it('is defined', () => {
          expect(selectors.auth.user.team.isCaptain).toBeDefined();
        });

        it('returns falsy when no user exists', () => {
          const team = mocks.createTeam();

          const state = merge({}, initialState, {
            // no user exists
            teamsData: { teamsById: { [team.uid]: team } },
          });

          const props = {
            teamId: team.uid,
          };

          expect(selectors.auth.user.team.isCaptain(state, props)).toBeFalsy();
        });

        it('returns falsy when no user and no team exists', () => {
          // This test is to make sure that the u = {} t = {},
          // u.uid === t.captain_id (undefined === undefined) case, doesn't
          // return true.

          const team = mocks.createTeam();

          const state = merge({}, initialState, {
            // no user exists
            // no team exists
          });

          const props = {
            teamId: team.uid,
          };

          expect(selectors.auth.user.team.isCaptain(state, props)).toBeFalsy();
        });

        it('returns falsy when user is NOT captain', () => {
          const user = mocks.createUser();
          const team = mocks.createTeam();
          // mocks.setUserCaptain(user, team);

          const state = merge({}, initialState, {
            auth: { user },
            usersData: { usersById: { [user.uid]: user } },
            teamsData: { teamsById: { [team.uid]: team } },
          });

          const props = {
            teamId: team.uid,
          };

          expect(selectors.auth.user.team.isCaptain(state, props)).toBeFalsy();
        });

        it('returns falsy when user IS captain', () => {
          const user = mocks.createUser();
          const team = mocks.createTeam();
          mocks.setUserCaptain(user, team);

          const state = merge({}, initialState, {
            auth: { user },
            entities: {
              teams: { byId: { [team.uid]: team } },
              users: { byId: { [user.uid]: user } },
            },
          });

          const props = {
            teamId: team.uid,
          };

          expect(selectors.auth.user.team.isCaptain(state, props)).toBeTruthy();
        });
      });

      describe('organizationIds', () => {
        // describe('organizationIds', () => {
        it('is defined', () => {
          expect(selectors.auth.user.team.organizationIds).toBeDefined();
        });

        it('returns empty array when user undefined', () => {
          const team = mocks.createTeam();

          const state = merge({}, initialState, {
            entities: {
              teams: { byId: { [team.uid]: team } },
              // no user exists
            },
          });

          const props = { teamId: team.uid };

          expect(
            selectors.auth.user.team.organizationIds(state, props),
          ).toEqual([]);
        });

        it('returns empty array for team members', () => {
          const team = mocks.createTeam();
          const teamMember = mocks.createUser({
            owned_teams: [team.uid],
          });

          const state = merge({}, initialState, {
            auth: { user: teamMember },
            entities: {
              teams: { byId: { [team.uid]: team } },
              users: { byId: { [teamMember.uid]: teamMember } },
            },
          });

          const props = { teamId: team.uid };

          expect(
            selectors.auth.user.team.organizationIds(state, props),
          ).toEqual([]);
        });

        it('returns ids for org admins', () => {
          const org = mocks.createOrganization();
          const team = mocks.createTeam({ organization_ids: [org.uid] });
          const orgAdmin = mocks.createUser({
            owned_organizations: [org.uid],
          });

          const state = merge({}, initialState, {
            auth: { user: orgAdmin },
            entities: {
              organizations: { byId: { [org.uid]: org } },
              teams: { byId: { [team.uid]: team } },
              users: { byId: { [orgAdmin.uid]: orgAdmin } },
            },
          });

          const props = { teamId: team.uid };

          expect(
            selectors.auth.user.team.organizationIds(state, props),
          ).toEqual([org.uid]);
        });

        it('returns ids for network admins', () => {
          const org = mocks.createOrganization();
          const team = mocks.createTeam({ organization_ids: [org.uid] });
          const networkAdmin = mocks.createUser({
            networked_organizations: [org.uid],
          });

          const state = merge({}, initialState, {
            auth: { user: networkAdmin },
            entities: {
              organizations: { byId: { [org.uid]: org } },
              teams: { byId: { [team.uid]: team } },
              users: { byId: { [networkAdmin.uid]: networkAdmin } },
            },
          });

          const props = { teamId: team.uid };

          expect(
            selectors.auth.user.team.organizationIds(state, props),
          ).toEqual([org.uid]);
        });
      });
    });
  });
});

describe('team', () => {
  describe('participationPercentDerived', () => {
    it('ignores non-100 and survey_ordinal, counts whole team', () => {
      const team = mocks.createTeam();
      const classroom1 = mocks.createClassroom({
        team_id: team.uid,
        num_students: 5,
      });
      const classroom2 = mocks.createClassroom({
        team_id: team.uid,
        num_students: 5,
      });
      const cycle = mocks.createCycle({ team_id: team.uid });

      const participation1 = [
        { n: 2, survey_ordinal: 1, value: '100' }, // counted
        // This participation data SHOULD be counted, even though the survey
        // ordinal makes it appear to have come from a different cycle. Neptune
        // manages this, and we should trust it is correct given the date
        // ranges Copilot supplies.
        { n: 2, survey_ordinal: 2, value: '100' },
        { n: 2, survey_ordinal: 1, value: '33' }, // NOT counted (<100 prog)
      ];
      const participation2 = [
        { n: 2, survey_ordinal: 1, value: '100' }, // counted
      ];

      const state = merge({}, initialState, {
        entities: {
          classrooms: {
            byId: {
              [classroom1.uid]: classroom1,
              [classroom2.uid]: classroom2,
            },
          },
          cycles: {
            classroomParticipationById: {
              [cycle.uid]: {
                [classroom1.uid]: participation1,
                [classroom2.uid]: participation2,
              },
            },
          },
          teams: { byId: { [team.uid]: team } },
        },
      });

      const props = { teamId: team.uid, parentLabel: cycle.short_uid };

      // 6 students out of 10 = 60%
      expect(selectors.cycle.participationPercentDerived(state, props)).toEqual(
        60,
      );
    });

    describe('authUser', () => {
      it('sums just the users classrooms', () => {
        const user = mocks.createUser();
        const team = mocks.createTeam();
        const userClassroom1 = mocks.createClassroom({
          team_id: team.uid,
          contact_id: user.uid,
          num_students: 5,
        });
        const userClassroom2 = mocks.createClassroom({
          team_id: team.uid,
          contact_id: user.uid,
          num_students: 5,
        });
        const otherClassroom = mocks.createClassroom({
          team_id: team.uid,
          num_students: 5,
        });
        const cycle = mocks.createCycle({ team_id: team.uid });

        const userParticipation1 = [
          { n: 2, survey_ordinal: 1, value: '100' },
          { n: 2, survey_ordinal: 2, value: '100' },
          { n: 2, survey_ordinal: 1, value: '33' }, // NOT counted
        ];
        const userParticipation2 = [{ n: 2, survey_ordinal: 1, value: '100' }];
        const otherParticipation = [{ n: 2, survey_ordinal: 1, value: '100' }];

        const state = merge({}, initialState, {
          auth: { user },
          entities: {
            classrooms: {
              byId: {
                [userClassroom1.uid]: userClassroom1,
                [userClassroom2.uid]: userClassroom2,
                [otherClassroom.uid]: otherClassroom,
              },
            },
            cycles: {
              classroomParticipationById: {
                [cycle.uid]: {
                  [userClassroom1.uid]: userParticipation1,
                  [userClassroom2.uid]: userParticipation2,
                  [otherClassroom.uid]: otherParticipation,
                },
              },
            },
            teams: { byId: { [team.uid]: team } },
            users: { byId: { [user.uid]: user } },
          },
        });

        const props = { teamId: team.uid, parentLabel: cycle.short_uid };

        // 6 students out of 10 = 60% (2 other students on the team ignored).
        expect(
          selectors.cycle.participationPercentDerived.authUser(state, props),
        ).toEqual(60);
      });
    });
  });
});

describe('classroom', () => {
  describe('participationByCycle', () => {
    describe('percent', () => {
      it('ignores non-100 and survey_ordinal, counts one classroom', () => {
        const team = mocks.createTeam();
        const classroom1 = mocks.createClassroom({
          team_id: team.uid,
          num_students: 5,
        });
        const classroom2 = mocks.createClassroom({
          team_id: team.uid,
          num_students: 5,
        });
        const cycle = mocks.createCycle({ team_id: team.uid });

        const participation1 = [
          { n: 2, survey_ordinal: 1, value: '100' }, // counted
          // This participation data SHOULD be counted, even though the survey
          // ordinal makes it appear to have come from a different cycle.
          // Neptune manages this, and we should trust it is correct given the
          // date ranges Copilot supplies.
          { n: 2, survey_ordinal: 2, value: '100' },
          { n: 2, survey_ordinal: 1, value: '33' }, // NOT counted (<100 prog)
        ];
        const participation2 = [
          { n: 2, survey_ordinal: 1, value: '100' }, // NOT, wrong class
        ];

        const state = merge({}, initialState, {
          entities: {
            classrooms: {
              byId: {
                [classroom1.uid]: classroom1,
                [classroom2.uid]: classroom2,
              },
            },
            cycles: {
              byId: { [cycle.uid]: cycle },
              classroomParticipationById: {
                [cycle.uid]: {
                  [classroom1.uid]: participation1,
                  [classroom2.uid]: participation2,
                },
              },
            },
            teams: {
              byId: { [team.uid]: team },
            },
          },
        });

        const props = { teamId: team.uid, classroomId: classroom1.uid };

        // 4 students out of 5 = 80%
        expect(
          selectors.classroom.participationByCycle.percent(state, props),
        ).toEqual(80);
      });
    });
  });
});

describe('reports', () => {
  describe('team', () => {
    describe('classroomReports', () => {
      it('names reports by the class', () => {
        const program = mocks.createProgram({ use_classrooms: 1 });
        const team = mocks.createTeam({ program_id: program.uid });
        const classroom = mocks.createClassroom({
          team_id: team.uid,
          num_students: 5,
        });
        const report = generateDatasetReport(null, team.uid, classroom.uid);

        const state = merge({}, initialState, {
          entities: {
            classrooms: {
              byId: {
                [classroom.uid]: classroom,
              },
            },
            programs: {
              byId: { [program.uid]: program },
            },
            reports: {
              byTeam: {
                [team.uid]: {
                  [report.issue_date]: [report],
                },
              },
            },
            teams: {
              byId: { [team.uid]: team },
            },
          },
        });

        const props = { teamId: team.uid };

        expect(
          selectors.reports.team.classroomReports(state, props),
        ).toMatchObject({
          [report.issue_date]: [
            {
              name: classroom.name,
            },
          ],
        });
      });

      it('names reports by the team when rosterless', () => {
        const program = mocks.createProgram({ use_classrooms: 0 });
        const team = mocks.createTeam({ program_id: program.uid });
        const classroom = mocks.createClassroom({
          team_id: team.uid,
          num_students: 5,
        });
        const report = generateDatasetReport(null, team.uid, classroom.uid);

        const state = merge({}, initialState, {
          entities: {
            classrooms: {
              byId: {
                [classroom.uid]: classroom,
              },
            },
            programs: {
              byId: { [program.uid]: program },
            },
            reports: {
              byTeam: {
                [team.uid]: {
                  [report.issue_date]: [report],
                },
              },
            },
            teams: {
              byId: { [team.uid]: team },
            },
          },
        });

        const props = { teamId: team.uid };

        expect(
          selectors.reports.team.classroomReports(state, props),
        ).toMatchObject({
          [report.issue_date]: [
            {
              name: team.name,
            },
          ],
        });
      });
    });
  });
});
