import * as types from './actionTypes';

export default (state = {}, action) => {
  if (action.type === types.DASHBOARD_ADD_OPTIONS) {
    const options = {};

    action.options.forEach(actionTask => {
      const { team, step, task, status } = actionTask;
      const optionKey = `${team.uid}:${step.parentLabel}:${task.label}`;

      options[optionKey] = {
        key: optionKey,
        team: team.name && team.name,
        stage: step.name && step.name,
        task: task.title && task.title,
        status: status ? 'complete' : 'incomplete',
      };
    });

    return {
      ...state,
      ...options,
    };
  }

  if (action.type === types.DASHBOARD_REMOVE_OPTIONS) {
    return {};
  }

  return state;
};
