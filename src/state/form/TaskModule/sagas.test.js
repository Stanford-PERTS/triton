import { expectSaga } from 'redux-saga-test-plan';
import { select } from 'redux-saga/effects';
import moment from 'moment/moment';

import * as responsesActions from 'state/responses/actions';
import mocks from 'mocks';
import selectors from 'state/selectors';
import taskModuleSaga from './sagas';
import { formValuesToBody } from 'state/responses/helpers';
import {
  RESPONSE_TYPE_USER,
  RESPONSE_TYPE_TEAM,
} from 'state/form/TaskModule/actionTypes';

describe('form/TaskModule/sagas', () => {
  const team = mocks.createTeam();
  const user = mocks.createUser();

  const stepType = 'single';
  const parentLabel = 'recruitment';
  const moduleLabel = 'SagaTestModule';
  const page = 4;
  const totalPages = 5;
  const match = {
    params: { stepType, parentLabel, moduleLabel, page, totalPages },
  };

  describe('user response requests', () => {
    const form = 'fooForm';
    const task = {
      responseType: RESPONSE_TYPE_USER,
      label: moduleLabel,
    };

    it('should handle new responses', () => {
      const formValues = {
        response1: 'foo',
        response2: 'bar',
        response3: 'baz',
      };
      const action = {
        payload: { formValues, match, task, team /* no response */ },
      };

      return expectSaga(taskModuleSaga, action)
        .provide([[select(selectors.auth.user.uid), user.uid]])
        .put(
          responsesActions.addResponse({
            body: formValuesToBody(formValues),
            type: task.responseType,
            user_id: user.uid,
            team_id: team.uid,
            parent_id: parentLabel,
            module_label: moduleLabel,
            progress: 100,
            page: 4,
          }),
        )
        .run();
    });

    it('should update existing responses', () => {
      const modified = String(
        moment()
          .utc()
          .format(),
      );
      const existingBody = {
        response1: { value: 'foo', modified },
        response2: { value: 'bar', modified },
        response3: { value: 'baz', modified },
      };

      const newKey = 'response2';
      const newValue = 'barbarbar';
      const newFormValues = { [newKey]: newValue };
      const newBody = { [newKey]: { value: newValue, modified } };

      const existingResponse = {
        uid: 'Response_001',
        body: existingBody,
        type: task.responseType,
        user_id: user.uid,
        team_id: team.uid,
        parent_id: parentLabel,
        module_label: moduleLabel,
        progress: 100,
        page,
      };

      const action = {
        payload: {
          form,
          formValues: newFormValues,
          match,
          task,
          team,
          response: existingResponse,
        },
      };

      return expectSaga(taskModuleSaga, action)
        .provide([
          [select(selectors.auth.user.uid), user.uid],
          // No error code returned.
          [select(selectors.form.errorCode, { form }), undefined],
        ])
        .put(
          responsesActions.updateResponse(
            existingResponse.uid,
            {
              uid: existingResponse.uid,
              body: newBody,
              type: task.responseType,
              user_id: user.uid,
              team_id: team.uid,
              parent_id: parentLabel,
              module_label: moduleLabel,
              progress: 100,
              page,
            },
            false, // no force
          ),
        )
        .run();
    });
  });

  describe('team response requests', () => {
    const form = 'fooForm';
    const task = {
      responseType: RESPONSE_TYPE_TEAM,
      label: moduleLabel,
    };

    it('should handle new responses', () => {
      const formValues = {
        response1: 'foo',
        response2: 'bar',
        response3: 'baz',
      };
      const action = {
        payload: { formValues, match, task, team /* no response */ },
      };

      return expectSaga(taskModuleSaga, action)
        .provide([[select(selectors.auth.user.uid), user.uid]])
        .put(
          responsesActions.addResponse({
            body: formValuesToBody(formValues),
            type: task.responseType,
            // user_id will be an empty string for team responses
            user_id: '',
            team_id: team.uid,
            parent_id: parentLabel,
            module_label: moduleLabel,
            progress: 100,
            page: 4,
          }),
        )
        .run();
    });

    it('should update existing responses', () => {
      const modified = moment()
        .utc()
        .format();
      const existingBody = {
        response1: { value: 'foo', modified },
        response2: { value: 'bar', modified },
        response3: { value: 'baz', modified },
      };

      const newKey = 'response2';
      const newValue = 'barbarbar';
      const newFormValues = { [newKey]: newValue };
      const newBody = {
        [newKey]: { value: newValue, modified },
      };

      const existingResponse = {
        uid: 'Response_001',
        body: existingBody,
        type: task.responseType,
        user_id: '',
        team_id: team.uid,
        parent_id: parentLabel,
        module_label: moduleLabel,
        progress: 100,
        page,
      };

      const action = {
        payload: {
          form,
          formValues: newFormValues,
          match,
          task,
          team,
          response: existingResponse,
        },
      };

      return expectSaga(taskModuleSaga, action)
        .provide([
          [select(selectors.auth.user.uid), user.uid],
          // No error code returned.
          [select(selectors.form.errorCode, { form }), undefined],
        ])
        .put(
          responsesActions.updateResponse(
            existingResponse.uid,
            {
              uid: existingResponse.uid,
              body: newBody,
              type: task.responseType,
              user_id: '',
              team_id: team.uid,
              parent_id: parentLabel,
              module_label: moduleLabel,
              progress: 100,
              page,
            },
            false, // no force
          ),
        )
        .run();
    });
  });
});
