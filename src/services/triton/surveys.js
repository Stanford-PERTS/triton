import {
  NEPTUNE_URL_PREFIX,
  TRITON_URL_PREFIX,
  fetchApi,
  getAuthorization,
} from './config';

/**
 * We encode metric labels as a JSON array because it allows Qualtrics to grep
 * for, e.g. '"meaningful-work"'. That prevents partial-match collision between
 * labels, e.g. will never match 'meaningful-work-new'.
 * @param  {Object} survey survey
 * @param  {string} prop   some survey property containing an array of ids, like
 *                         'metrics' or 'open_responses'
 * @return {string}        JSON array of metric labels
 */
export const metricsStr = (survey, prop) =>
  JSON.stringify(survey[prop].map(id => survey.metric_labels[id]));

export const getSurveyParams = survey => ({
  ...survey.meta,
  learning_conditions: metricsStr(survey, 'metrics'),
  open_response_lcs: survey.open_responses
    ? metricsStr(survey, 'open_responses')
    : '[]',
});

export const query = () => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/surveys`;

  return fetchApi(url, options);
};

export const queryByTeam = teamId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/survey`;

  return fetchApi(url, options);
};

export const get = surveyId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/surveys/${surveyId}`;

  return fetchApi(url, options);
};

const updateSurvey = survey => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(survey),
  };

  const url = `${TRITON_URL_PREFIX}/api/surveys/${survey.uid}`;

  return fetchApi(url, options);
};

const codeToPayload = survey => code => ({
  method: 'PUT',
  path: `/api/codes/${code.replace(/ /g, '-')}`,
  body: {
    organization_id: survey.team_id,
    portal_message: survey.portal_message,
    survey_params: getSurveyParams(survey),
  },
});

const updateParticipationCodes = survey => {
  if (survey.codes.length === 0) {
    return Promise.resolve();
  }
  const patchBody = survey.codes.map(codeToPayload(survey));

  const options = {
    method: 'PATCH',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patchBody),
  };

  const url = `${NEPTUNE_URL_PREFIX}/api/codes`;

  return fetchApi(url, options);
};

export const update = survey =>
  updateSurvey(survey).then(response =>
    updateParticipationCodes(response)
      // Throw away Neptune's participation code response; redux wants the
      // survey
      .then(() => response),
  );
