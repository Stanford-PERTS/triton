import { SURVEY_UPDATE_FAILURE } from '../../surveys/actionTypes';

const surveyForm = (state = {}, action) => {
  switch (action.type) {
    case SURVEY_UPDATE_FAILURE:
      return {
        ...state,
        syncErrors: {
          ...state.syncErrors,
          _form: action.error.message,
        },
      };

    default:
      return state;
  }
};

export default surveyForm;
