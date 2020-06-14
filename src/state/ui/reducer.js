import { combineReducers } from 'redux';
import flashReducer from './reducer.flash';
import loadingReducer from './reducer.loading';
import redirectReducer from './reducer.redirect';

export default combineReducers({
  flash: flashReducer,
  loading: loadingReducer,
  redirect: redirectReducer,
});
