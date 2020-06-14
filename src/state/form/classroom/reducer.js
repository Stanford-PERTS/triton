import { CLASSROOM_ADD_FAILURE } from '../../classrooms/actionTypes';

const classroomForm = (state = {}, action) => {
  switch (action.type) {
    case CLASSROOM_ADD_FAILURE:
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

export default classroomForm;
