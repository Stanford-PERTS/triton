import { all, takeEvery } from 'redux-saga/effects';
import map from 'lodash/map';

import * as templatesApi from 'services/triton/templates';
import generateSagaFunctions from 'state/helpers/generateSagaFunctions';
import { slice } from './';

const apiCalls = action => ({
  QUERY: {
    undefined: [templatesApi.query],
  },

  GET: {
    undefined: [templatesApi.get, action.uid],
  },
});

const sagaFunctions = generateSagaFunctions(apiCalls, slice);

export default function* sagas() {
  yield all([...map(sagaFunctions, (fn, type) => takeEvery(type, fn))]);
}
