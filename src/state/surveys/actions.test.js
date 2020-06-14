import * as actions from './actions';
import * as types from './actionTypes';

describe('surveys actions', () => {
  it("should create an action to request a team's surveys", () => {
    const teamId = 'Team_001';
    const expectedAction = {
      type: types.SURVEY_BY_TEAM_REQUEST,
      teamId,
    };
    expect(actions.queryTeamSurveys(teamId)).toEqual(expectedAction);
  });

  it('should create an action to request a survey', () => {
    const surveyId = 'Survey_001';
    const expectedAction = {
      type: types.SURVEY_GET_REQUEST,
      surveyId,
    };
    expect(actions.getSurvey(surveyId)).toEqual(expectedAction);
  });
  it('should create an action to update a survey', () => {
    const survey = { uid: 'Survey_001' };
    const expectedAction = {
      type: types.SURVEY_UPDATE_REQUEST,
      survey,
    };
    expect(actions.updateSurvey(survey)).toEqual(expectedAction);
  });
});
