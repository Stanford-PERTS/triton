import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { RESPONSE_TYPE_USER } from 'state/form/TaskModule/actionTypes';
import * as responsesActions from 'state/responses/actions';
import { responseParentId } from 'state/responses/helpers';
import selectors from 'state/selectors';

import TaskCaptainOnlyStyled from './TaskCaptainOnly';
import CompletionTracking from 'programs/CompletionTracking';
import Button from 'components/Button';
import Card from 'components/Card';
import IconComplete from 'components/IconComplete';
import Show from 'components/Show';

export const submitButtonModule = props => {
  const { cycle, step, task, team, response, userId } = props;
  const { addResponse, updateResponse } = props.actions;
  const { responseType = RESPONSE_TYPE_USER } = task;

  if (response) {
    updateResponse(response.uid, {
      ...response,
      progress: response.progress === 0 ? 100 : 0,
    });
  } else {
    addResponse({
      body: {},
      module_label: task.label,
      parent_id: responseParentId(step, cycle),
      progress: 100,
      type: responseType,
      team_id: team.uid,
      user_id: responseType === RESPONSE_TYPE_USER ? userId : '',
    });
  }
};

class TaskButtonModule extends React.Component {
  render() {
    const { children, isUpdating, response, task } = this.props;
    const progress = (response && response.progress) || 0;
    const complete = progress === 100;

    const showCompletion =
      task.showCompletion === undefined
        ? !task.captainOnlyEditable && !task.captainOnlyVisible
        : task.showCompletion;
    const showButton = task.hasCaptainPermission || !task.captainOnlyEditable;

    return (
      <Card>
        <Card.Header
          task
          left={<IconComplete complete={complete} />}
          right={<TaskCaptainOnlyStyled />}
        >
          {task.title}
        </Card.Header>
        {children}
        <Show when={showButton}>
          <Card.Content>
            <Button
              onClick={() => submitButtonModule(this.props)}
              loading={isUpdating}
              cancel={complete}
            >
              {complete ? 'Mark Incomplete' : task.buttonText}
            </Button>
          </Card.Content>
        </Show>
        <Show when={showCompletion}>
          <CompletionTracking task={task} />
        </Show>
      </Card>
    );
  }
}

const mapStateToProps = (state, props) => ({
  userId: selectors.auth.user.uid(state, props),
  isUpdating: selectors.updating.responses(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(responsesActions, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(TaskButtonModule);
