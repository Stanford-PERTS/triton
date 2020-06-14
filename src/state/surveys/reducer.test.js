import deepFreeze from 'deep-freeze';

import { initAction } from 'state/actions';

import * as types from './actionTypes';
import reducer, { getActiveMetrics } from './reducer';
import initialState from './initialState';

describe('surveys reducer', () => {
  describe('init', () => {
    it('should return the initial state', () => {
      expect(reducer(undefined, initAction)).toEqual(initialState);
    });

    it('should return state when slice type not present', () => {
      const action = { type: 'ANOTHER_ACTION_TYPE' };
      const stateBefore = {
        ...initialState,
        byId: { Survey_001: {}, Survey_002: {}, Survey_003: {} },
      };

      expect(reducer(stateBefore, action)).toEqual(stateBefore);
    });
  });

  describe('SURVEY_BY_TEAM_*', () => {
    it('should handle SURVEY_BY_TEAM_REQUEST', () => {
      const action = { type: types.SURVEY_BY_TEAM_REQUEST };

      const stateBefore = { ...initialState };
      const stateAfter = { ...stateBefore, loading: true };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle SURVEY_BY_TEAM_SUCCESS', () => {
      const survey = {
        uid: 'Survey_001',
        team_id: 'Team_001',
        metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
      };
      const action = { type: types.SURVEY_BY_TEAM_SUCCESS, survey };

      const stateBefore = { ...initialState, loading: true };
      const stateAfter = {
        ...stateBefore,
        byId: { ...stateBefore.byId, [action.survey.uid]: action.survey },
        activeMetrics: getActiveMetrics(action.survey.metrics),
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle SURVEY_BY_TEAM_FAILURE', () => {
      const error = { code: '403', message: 'Unauthorized' };
      const action = { type: types.SURVEY_BY_TEAM_FAILURE, error };

      const stateBefore = { ...initialState, loading: true };
      const stateAfter = {
        ...stateBefore,
        error: action.error,
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });

  describe('SURVEY_GET_*', () => {
    it('should handle SURVEY_GET_REQUEST', () => {
      const action = { type: types.SURVEY_GET_REQUEST };

      const stateBefore = { ...initialState };
      const stateAfter = { ...stateBefore, loading: true };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle SURVEY_GET_SUCCESS', () => {
      const survey = {
        uid: 'Survey_001',
        team_id: 'Team_001',
        metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
      };
      const action = { type: types.SURVEY_GET_SUCCESS, survey };

      const stateBefore = { ...initialState, loading: true };
      const stateAfter = {
        ...stateBefore,
        byId: { ...stateBefore.byId, [action.survey.uid]: action.survey },
        activeMetrics: getActiveMetrics(action.survey.metrics),
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle SURVEY_GET_FAILURE', () => {
      const error = { code: '403', message: 'Unauthorized' };
      const action = { type: types.SURVEY_GET_FAILURE, error };

      const stateBefore = { ...initialState, loading: true };
      const stateAfter = {
        ...stateBefore,
        error: action.error,
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });

  describe('SURVEY_UPDATE_*', () => {
    it('should handle SURVEY_UPDATE_REQUEST', () => {
      const survey = {
        uid: 'Survey_001',
        team_id: 'Team_001',
        metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
      };
      const action = { type: types.SURVEY_UPDATE_REQUEST, survey };

      const stateBefore = {
        ...initialState,
        byId: {
          Survey_001: {
            uid: 'Survey_001',
            team_id: 'Team_001',
            metrics: ['Metric_001', 'Metric_002'],
          },
        },
      };
      const stateAfter = {
        ...stateBefore,
        loading: true,
      };
      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle SURVEY_UPDATE_SUCCESS', () => {
      const survey = {
        uid: 'Survey_001',
        team_id: 'Team_001',
        metrics: ['Metric_001', 'Metric_002', 'Metric_003', 'Metric_004'],
      };
      const action = { type: types.SURVEY_UPDATE_SUCCESS, survey };

      const stateBefore = {
        ...initialState,
        byId: {
          Survey_001: {
            uid: 'Survey_001',
            team_id: 'Team_001',
            metrics: ['Metric_001', 'Metric_002'],
          },
        },
        loading: true,
      };
      const stateAfter = {
        ...stateBefore,
        byId: {
          ...stateBefore.byId,
          [action.survey.uid]: action.survey,
        },
        activeMetrics: getActiveMetrics(action.survey.metrics),
        loading: false,
      };

      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });

    it('should handle SURVEY_UPDATE_FAILURE', () => {
      const error = { code: '403', message: 'Unauthorized' };
      const action = { type: types.SURVEY_UPDATE_FAILURE, error };

      const stateBefore = {
        ...initialState,
        byId: {
          Survey_001: {
            uid: 'Survey_001',
            team_id: 'Team_001',
            metrics: ['Metric_001', 'Metric_002'],
          },
        },
        loading: true,
      };
      const stateAfter = {
        ...stateBefore,
        error: action.error,
        loading: false,
      };
      deepFreeze(stateBefore);
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
  });
});
