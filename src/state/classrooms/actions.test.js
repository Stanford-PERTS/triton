import { actionMethods, actionStages } from 'state/actionTypes';
import * as actions from './actions';
import * as types from './actionTypes';

describe('classrooms actions', () => {
  const teamId = 'Team_001';
  const classroom = {
    uid: 'Classroom_001',
    name: 'Class One',
    team_id: teamId,
  };

  it('creates an action to request team classrooms with participation', () => {
    const expectedAction = {
      actionPrefix: 'HOA',
      actionSlice: 'CLASSROOMS',
      actionMethod: actionMethods.QUERY,
      actionName: 'WITH_PARTICIPATION',
      actionOptions: 'BY_TEAM',
      actionStage: actionStages.REQUEST,
      type: 'HOA_CLASSROOMS_QUERY_WITH_PARTICIPATION_BY_TEAM_REQUEST',
      teamId,
    };
    expect(actions.queryClassroomsWithParticipation(teamId)).toEqual(
      expectedAction,
    );
  });

  it('creates an action to request team classrooms', () => {
    const expectedAction = {
      actionSlice: 'CLASSROOMS',
      actionMethod: actionMethods.QUERY,
      actionByEntity: 'BY_TEAM',
      actionStage: actionStages.REQUEST,
      type: 'CLASSROOMS_QUERY_BY_TEAM_REQUEST',
      teamId,
    };
    expect(actions.queryClassroomsByTeam(teamId)).toEqual(expectedAction);
  });

  it('creates an action to request a specific classrooms', () => {
    const classroomId = 'Classroom_001';
    const expectedAction = {
      actionSlice: 'CLASSROOMS',
      actionMethod: actionMethods.GET,
      actionStage: actionStages.REQUEST,
      actionUids: [classroomId],
      type: types.CLASSROOM_GET_REQUEST,
      classroomId,
    };
    expect(actions.getClassroom(classroomId)).toEqual(expectedAction);
  });

  it('creates an action to request creating a classroom', () => {
    const expectedAction = {
      actionSlice: 'CLASSROOMS',
      actionMethod: actionMethods.ADD,
      actionStage: actionStages.REQUEST,
      type: types.CLASSROOM_ADD_REQUEST,
      classroomParams: classroom,
    };
    expect(actions.addClassroom(classroom)).toEqual(expectedAction);
  });

  it('creates an action to update a classroom', () => {
    const expectedAction = {
      actionSlice: 'CLASSROOMS',
      actionMethod: actionMethods.UPDATE,
      actionStage: actionStages.REQUEST,
      actionUids: [classroom.uid],
      type: types.CLASSROOM_UPDATE_REQUEST,
      classroom,
    };
    expect(actions.updateClassroom(classroom)).toEqual(expectedAction);
  });

  it('creates an action to set classroom mode', () => {
    const mode = 'someMode';
    const expectedAction = {
      type: types.CLASSROOM_MODE_SET,
      mode,
    };
    expect(actions.setClassroomMode(mode)).toEqual(expectedAction);
  });

  it('creates an action to reset classroom mode', () => {
    const expectedAction = {
      type: types.CLASSROOM_MODE_RESET,
    };
    expect(actions.resetClassroomMode()).toEqual(expectedAction);
  });

  it('creates an action to remove a classroom', () => {
    const expectedAction = {
      type: types.CLASSROOM_REMOVE_REQUEST,
      classroom,
      teamId,
    };
    expect(actions.removeClassroom(classroom, teamId)).toEqual(expectedAction);
  });
});
