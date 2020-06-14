import { getSurveyParams } from './surveys';

describe('survey api service', () => {
  it('has correct survey params with NO open responses', () => {
    const survey = {
      metrics: ['Metric_001', 'Metric_002'],
      open_responses: [],
      metric_labels: { Metric_001: 'foo', Metric_002: 'bar' },
    };

    expect(getSurveyParams(survey)).toEqual({
      learning_conditions: '["foo","bar"]',
      open_response_lcs: '[]',
    });
  });

  it('has correct survey params WITH open responses', () => {
    const survey = {
      metrics: ['Metric_001', 'Metric_002'],
      open_responses: ['Metric_001'],
      metric_labels: { Metric_001: 'foo', Metric_002: 'bar' },
    };

    expect(getSurveyParams(survey)).toEqual({
      learning_conditions: '["foo","bar"]',
      open_response_lcs: '["foo"]',
    });
  });
});
