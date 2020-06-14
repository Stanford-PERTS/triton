import { all, call, put, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';
// import * as matchers from 'redux-saga-test-plan/matchers';
import { callWithApiAuthentication as callWithAuth } from '../api';
import selectors from 'state/selectors';
import * as actions from './actions';
import * as cyclesActions from 'state/cycles/actions';
import * as uiActions from 'state/ui/actions';
import * as types from './actionTypes';
import * as surveyTypes from 'state/surveys/actionTypes';
import * as teamTypes from 'state/teams/actionTypes';
import * as userTypes from 'state/users/actionTypes';
import { CLEAR_FLAGS } from 'state/actionTypes';
import * as classroomsApi from 'services/triton/classrooms';
import { failureTypeOf, successTypeOf } from 'state/helpers';
import {
  addClassroomRequest,
  classroomDetailRequest,
  classroomsQueryByTeam,
  classroomRemoveRequest,
  classroomRequest as classroomRequestSaga,
  classroomsWithParticipationRequest,
  updateClassroomsRequest,
} from './sagas';

import * as route from 'routes';

describe('classrooms sagas', () => {
  const error = { code: 'server/403', message: 'Unauthorized access.' };

  describe('classroomRequestSaga', () => {
    it('gets classroom', () => {
      const classroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
        team_id: 'Team_VIPER1234',
      };

      const action = actions.getClassroom(classroom.uid);

      return expectSaga(classroomRequestSaga, action)
        .provide([
          [
            call(callWithAuth, classroomsApi.get, action.classroomId),
            classroom,
          ],
        ])
        .call(callWithAuth, classroomsApi.get, action.classroomId)
        .put(actions.getClassroomSuccess(classroom))
        .run();
    });

    it('handles error', () => {
      const classroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
        team_id: 'Team_VIPER1234',
      };

      const action = actions.getClassroom(classroom.uid);

      return expectSaga(classroomRequestSaga, action)
        .provide([
          [
            call(callWithAuth, classroomsApi.get, action.classroomId),
            throwError(error),
          ],
        ])
        .put(actions.getClassroomFailure(error, action.classroomId))
        .put(uiActions.redirectTo(route.toHomeNoProgram()))
        .run();
    });
  });

  describe('addClassroomRequest', () => {
    const team = { uid: 'Team_VIPER1234', name: 'Team Viper' };
    const participantsForm = 'STUDENT_001\nSTUDENT_002';
    const classroom = {
      uid: 'Classroom_ENGL4SNEKS',
      name: 'English for Snakes',
      team_id: team.uid,
      student_ids: participantsForm,
    };

    const action = actions.addClassroom(classroom);
    const gen = addClassroomRequest(action);

    it('should POST new classroom', () => {
      expect(gen.next().value).toEqual(
        callWithAuth(classroomsApi.post, action.classroomParams),
      );
    });

    it('should re-query classroom for updated num_students', () => {
      expect(gen.next(classroom).value).toEqual(
        callWithAuth(classroomsApi.get, classroom.uid),
      );
    });

    it('should put addClassroomSuccess', () => {
      expect(gen.next(classroom).value).toEqual(
        put(actions.addClassroomSuccess(classroom)),
      );
    });

    it('puts redirectTo toTeamClassroom', () => {
      expect(gen.next(classroom).value).toEqual(
        put(
          uiActions.redirectTo(route.toTeamClassroom(team.uid, classroom.uid)),
        ),
      );
    });

    describe('on failure', () => {
      it('should put addClassroomFailure', () => {
        expect(gen.throw(error).value).toEqual(
          put(actions.addClassroomFailure(error)),
        );
      });

      it('should put redirectTo toTeamClassrooms', () => {
        expect(gen.next().value).toEqual(
          put(
            uiActions.redirectTo(
              route.toTeamClassrooms(action.classroomParams.team_id),
            ),
          ),
        );
      });
    });
  });

  describe('updateClassroomRequest', () => {
    it('update classroom, same team, no redirect', () => {
      const team = { uid: 'Team_VIPER1234', name: 'Team Viper' };
      const participantsForm = 'STUDENT_001\nSTUDENT_002';
      const existingClassroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
        team_id: team.uid,
        student_ids: participantsForm,
      };
      const updatedClassroom = {
        ...existingClassroom,
        name: 'Coding for Cobras',
      };

      const action = actions.updateClassroom(updatedClassroom);

      // no redirect since team did not change
      const redirect = null;

      return expectSaga(updateClassroomsRequest, action)
        .provide([
          [
            select(selectors.classroom, {
              classroomId: existingClassroom.uid,
            }),
            existingClassroom,
          ],
          [
            call(callWithAuth, classroomsApi.update, action.classroom),
            updatedClassroom,
          ],
        ])
        .call(callWithAuth, classroomsApi.update, action.classroom)
        .put(actions.updateClassroomSuccess(action.classroom))
        .put(uiActions.redirectTo(redirect))
        .run();
    });

    it('update classroom, team changed, redirect', () => {
      const team = { uid: 'Team_VIPER1234', name: 'Team Viper' };
      const participantsForm = 'STUDENT_001\nSTUDENT_002';
      const existingClassroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
        team_id: team.uid,
        student_ids: participantsForm,
      };
      const updatedClassroom = {
        ...existingClassroom,
        name: 'Coding for Cobras',
        team_id: 'Team_N3wT3@m!',
      };

      const action = actions.updateClassroom(updatedClassroom);

      // team changed, so we'll redirect
      const redirect = route.toTeamClassroom(
        action.classroom.team_id,
        action.classroom.uid,
      );

      return expectSaga(updateClassroomsRequest, action)
        .provide([
          [
            select(selectors.classroom, {
              classroomId: existingClassroom.uid,
            }),
            existingClassroom,
          ],
          [
            call(callWithAuth, classroomsApi.update, action.classroom),
            updatedClassroom,
          ],
        ])
        .call(callWithAuth, classroomsApi.update, action.classroom)
        .put(actions.updateClassroomSuccess(action.classroom))
        .put(uiActions.redirectTo(redirect))
        .run();
    });

    it('handles error', () => {
      const team = { uid: 'Team_VIPER1234', name: 'Team Viper' };
      const participantsForm = 'STUDENT_001\nSTUDENT_002';
      const existingClassroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
        team_id: team.uid,
        student_ids: participantsForm,
      };
      const updatedClassroom = {
        ...existingClassroom,
        name: 'Coding for Cobras',
      };

      const action = actions.updateClassroom(updatedClassroom);
      const redirect = route.toTeamClassrooms(action.classroom.team_id);

      return expectSaga(updateClassroomsRequest, action)
        .provide([
          [
            select(selectors.classroom, {
              classroomId: existingClassroom.uid,
            }),
            throwError(error),
          ],
        ])
        .put(actions.updateClassroomFailure(error, action.classroom.uid))
        .put(uiActions.redirectTo(redirect))
        .run();
    });
  });

  describe('classroomRemoveRequest', () => {
    it('should remove classroom', () => {
      const classroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
      };

      const action = actions.removeClassroom(classroom);

      return expectSaga(classroomRemoveRequest, action)
        .provide([
          [call(callWithAuth, classroomsApi.remove, action.classroom), true],
        ])
        .call(callWithAuth, classroomsApi.remove, action.classroom)
        .put({
          type: types.CLASSROOM_REMOVE_SUCCESS,
          classroomId: action.classroom.uid,
        })
        .put(uiActions.redirectTo(route.toTeamClassrooms(action.teamId)))
        .run();
    });

    it('should handle errors', () => {
      const classroom = {
        uid: 'Classroom_ENGL4SNEKS',
        name: 'English for Snakes',
      };

      const action = actions.removeClassroom(classroom);

      return expectSaga(classroomRemoveRequest, action)
        .provide([
          [
            call(callWithAuth, classroomsApi.remove, action.classroom),
            throwError(error),
          ],
        ])
        .call(callWithAuth, classroomsApi.remove, action.classroom)
        .put({ type: types.CLASSROOM_REMOVE_FAILURE, error })
        .put(uiActions.redirectTo(route.toTeamClassrooms(action.teamId)))
        .run();
    });
  });

  describe('classroomsQueryByTeamRequest', () => {
    it('should query classrooms', () => {
      const teamId = 'Team_001';

      const action = actions.queryClassroomsByTeam(teamId);
      const classrooms = [{ uid: 'Classroom_001' }, { uid: 'Classroom_002' }];

      return expectSaga(classroomsQueryByTeam, action)
        .provide([
          [
            call(callWithAuth, classroomsApi.queryByTeam, action.teamId),
            classrooms,
          ],
        ])
        .call(callWithAuth, classroomsApi.queryByTeam, action.teamId)
        .put(actions.queryClassroomsByTeamSuccess(classrooms, teamId))
        .run();
    });
  });

  describe('classroomsWithParticipationRequest', () => {
    const teamId = 'Team_001';
    const currentCycle = { uid: 'Cycle_001' };
    const classrooms = [{ uid: 'Classroom_001' }, { uid: 'Classroom_002' }];
    const participation = { foo: 'bar' };

    const hoaAction = actions.queryClassroomsWithParticipation(teamId);
    const classroomRequest = actions.queryClassroomsByTeam(teamId);
    const cycleRequest = cyclesActions.queryCyclesCurrentByTeam(teamId);
    const pptRequest = cyclesActions.queryParticipationByTeam(
      currentCycle,
      classrooms,
    );

    const hoaSuccess = actions.queryClassroomsWithParticipationSuccess(
      classrooms,
      teamId,
      participation,
    );
    const classroomSuccess = {
      ...classroomRequest,
      type: successTypeOf(classroomRequest),
      payload: classrooms,
    };
    const cycleSuccess = cyclesActions.queryCyclesCurrentByTeamSuccess(
      currentCycle,
    );
    const pptSuccess = cyclesActions.queryParticipationByTeamSuccess(
      currentCycle.uid,
      participation,
    );

    const classroomFailure = {
      type: failureTypeOf(classroomRequest),
      error: 'classroom query by team failure',
    };
    const cycleFailure = cyclesActions.queryCyclesCurrentByTeamFailure(
      'cycle query current by team failure',
      teamId,
    );
    const pptFailure = cyclesActions.queryParticipationByTeamFailure(
      'participation failure',
    );

    it('succeeds, with current cycle', () =>
      expectSaga(classroomsWithParticipationRequest, hoaAction)
        .put(classroomRequest)
        .put(cycleRequest)
        .dispatch(classroomSuccess)
        .dispatch(cycleSuccess)
        .put(pptRequest)
        .dispatch(pptSuccess)
        .put(hoaSuccess)
        .run());

    it('succeeds, with no current cycle', () =>
      expectSaga(classroomsWithParticipationRequest, hoaAction)
        .put(classroomRequest)
        .put(cycleRequest)
        .dispatch(classroomSuccess)
        .dispatch({ ...cycleSuccess, payload: null }) // no current cycle
        .not.put(pptRequest)
        .put(
          actions.queryClassroomsWithParticipationSuccess(
            classrooms,
            teamId,
            {}, // no participation
          ),
        )
        .run());

    it('fails if classroom request fails', () =>
      expectSaga(classroomsWithParticipationRequest, hoaAction)
        .put(classroomRequest)
        .put(cycleRequest)
        .dispatch(classroomFailure)
        .dispatch(cycleSuccess)
        .put(
          actions.queryClassroomsWithParticipationFailure(
            `Error: ${classroomFailure.error}`,
            teamId,
          ),
        )
        .run());

    it('fails if cycle request fails', () =>
      expectSaga(classroomsWithParticipationRequest, hoaAction)
        .put(classroomRequest)
        .put(cycleRequest)
        .dispatch(classroomSuccess)
        .dispatch(cycleFailure)
        .put(
          actions.queryClassroomsWithParticipationFailure(
            `Error: ${cycleFailure.error}`,
            teamId,
          ),
        )
        .run());

    it('fails if participation request fails', () =>
      expectSaga(classroomsWithParticipationRequest, hoaAction)
        .put(classroomRequest)
        .put(cycleRequest)
        .dispatch(classroomSuccess)
        .dispatch(cycleSuccess)
        .put(pptRequest)
        .dispatch(pptFailure)
        .put(
          actions.queryClassroomsWithParticipationFailure(
            `Error: ${pptFailure.error}`,
            teamId,
          ),
        )
        .run());
  });

  function mockClassroomDetailRequest(isOrgAdmin, teams) {
    const classroomId = 'Classroom_001';
    const team = { uid: 'Team_of-classroom' };
    return {
      action: {
        type: types.CLASSROOM_DETAIL_REQUEST,
        classroomId,
        teamId: team.uid,
      },
      classroom: { uid: classroomId, team_id: team.uid },
      classroomId,
      isOrgAdmin,
      organizationIds: ['Organization_001'],
      participation: 'participation',
      team: { uid: 'Team_of-classroom' },
      teams: teams.concat(team),
      survey: { uid: 'Survey_001', interval: 2 },
      userId: 'User_001',
      users: [{ uid: 'User_001' }],
    };
  }

  function provideClassroomDetailRequest(mocks) {
    const { isOrgAdmin, organizationIds, userId } = mocks;

    selectors.userIsTeamOrganizationAdmin = function(state, props) {
      return isOrgAdmin;
    };
    return [
      [select(selectors.userIsTeamOrganizationAdmin), isOrgAdmin],
      [select(selectors.getSupervisingOrganizationIds), organizationIds],
      [select(selectors.getUserUid), userId],
      [select(selectors.userIsAdmin), false],
      [select(selectors.authData), {}],
      [select(selectors.survey), { interval: 2 }],
    ];
  }

  xit('should handle a classroom detail request as org admin', () => {
    const isOrgAdmin = true;
    const orgTeams = [{ uid: 'Team_from-org' }];
    const mocks = mockClassroomDetailRequest(isOrgAdmin, orgTeams);
    // teams: [{ uid: 'Team_from-user' }],
    const {
      action,
      classroom,
      classroomId,
      organizationIds,
      participation,
      team,
      teams,
      users,
    } = mocks;

    return expectSaga(classroomDetailRequest, action)
      .provide(provideClassroomDetailRequest(mocks))
      .put({ type: types.CLASSROOM_GET_REQUEST, classroomId })
      .dispatch({ type: types.CLASSROOM_GET_SUCCESS, classroom })
      .put({ type: teamTypes.TEAM_ONLY_REQUEST, teamId: team.uid })
      .put({ type: userTypes.USERS_BY_TEAM_REQUEST, teamId: team.uid })
      .put({ type: types.CLASSROOM_PARTICIPATION_REQUEST, classroomId })
      .dispatch({ type: teamTypes.TEAM_ONLY_SUCCESS, team })
      .dispatch({ type: userTypes.USERS_BY_TEAM_SUCCESS, users })
      .dispatch({ type: types.CLASSROOM_PARTICIPATION_SUCCESS, participation })
      .put({
        type: teamTypes.TEAMS_BY_ORGANIZATION_REQUEST,
        organizationIds,
      })
      .dispatch({
        type: teamTypes.TEAMS_BY_ORGANIZATION_SUCCESS,
        orgTeams,
      })
      .put({
        type: types.CLASSROOM_DETAIL_SUCCESS,
        classroom,
        participation,
        team,
        teams,
        users,
      })
      .run();
  });

  xit('should handle a classroom detail request as not an org admin', () => {
    const isOrgAdmin = false;
    const userTeams = [{ uid: 'Team_from-user' }];
    const mocks = mockClassroomDetailRequest(isOrgAdmin, userTeams);
    const {
      action,
      classroom,
      classroomId,
      participation,
      survey,
      team,
      teams,
      userId,
      users,
    } = mocks;

    return (
      expectSaga(classroomDetailRequest, action)
        .provide(provideClassroomDetailRequest(mocks))
        .put({ type: types.CLASSROOM_GET_REQUEST, classroomId })
        .put({ type: userTypes.USER_REQUEST, uid: userId })
        .put({ type: teamTypes.TEAM_ONLY_REQUEST, teamId: team.uid })
        .put({ type: surveyTypes.SURVEY_BY_TEAM_REQUEST, teamId: team.uid })
        .dispatch({ type: types.CLASSROOM_GET_SUCCESS, classroom })
        .dispatch({ type: userTypes.USER_SUCCESS, user: users[0] })
        .dispatch({ type: teamTypes.TEAM_ONLY_SUCCESS, team })
        .dispatch({ type: surveyTypes.SURVEY_BY_TEAM_SUCCESS, survey })
        // agnostic to queryOptions in action
        .put.actionType(teamTypes.USER_TEAMS_REQUEST)
        .put({ type: userTypes.USERS_BY_TEAM_REQUEST, teamId: team.uid })
        .put({
          type: types.CLASSROOM_PARTICIPATION_REQUEST,
          classroomId,
          surveyInterval: survey.interval,
        })
        .dispatch({ type: teamTypes.USER_TEAMS_SUCCESS, teams })
        .dispatch({ type: userTypes.USERS_BY_TEAM_SUCCESS, users })
        .dispatch({
          type: types.CLASSROOM_PARTICIPATION_SUCCESS,
          participation,
        })
        // agnostic to other data within action
        .put.actionType(types.CLASSROOM_DETAIL_SUCCESS)
        .run()
    );
  });

  xit('should handle a successful update classrooms request', () => {
    const classrooms = [
      { uid: 'Classroom_001', name: 'Classroom One' },
      { uid: 'Classroom_002', name: 'Classroom Two' },
      { uid: 'Classroom_003', name: 'Classroom Three' },
    ];
    const teamId = 'Team_001';
    const action = {
      type: types.CLASSROOM_UPDATE_REQUEST,
      classrooms,
      teamId,
    };

    const gen = updateClassroomsRequest(action);

    // should call classroomsApi.update() for each classroom
    expect(gen.next().value).toEqual(
      all(
        classrooms.map(classroom =>
          call(callWithAuth, classroomsApi.update, classroom),
        ),
      ),
    );

    // should dispatch a CLASSROOM_UPDATE_SUCCESS action
    expect(gen.next(classrooms).value).toEqual(
      put({
        type: types.CLASSROOM_UPDATE_SUCCESS,
        classrooms,
      }),
    );
  });

  xit('should handle an unsuccessful update classrooms request', () => {
    const classrooms = [{ uid: 'Classroom_001', name: 'Classroom One' }];
    const teamId = 'Team_001';
    const action = {
      type: types.CLASSROOM_UPDATE_REQUEST,
      classrooms,
      teamId,
    };
    const redirect = route.toTeamClassrooms(teamId);

    const gen = updateClassroomsRequest(action);

    // should call classroomsApi.update() for each classroom
    expect(gen.next().value).toEqual(
      all(
        classrooms.map(classroom =>
          call(callWithAuth, classroomsApi.update, classroom),
        ),
      ),
    );

    // should dispatch a UPDATE_CLASSROOMS_FAILURE
    expect(gen.throw(error).value).toEqual(
      put({ type: types.CLASSROOM_UPDATE_FAILURE, error, redirect }),
    );

    // should dispatch CLEAR_FLAGS
    expect(gen.next().value).toEqual(put({ type: CLEAR_FLAGS }));
  });

  // TODO: finish adding tests for classrooms sagas
});
