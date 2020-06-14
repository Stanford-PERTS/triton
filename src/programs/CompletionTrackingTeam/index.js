import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  withCycleContext,
  withMonoContext,
  withStepContext,
  withTaskContext,
} from 'programs/contexts';
import selectors from 'state/selectors';
import merge from 'lodash/merge';

import { Progress } from 'antd';
import Card from 'components/Card';
import { TeamResponsesRow, TeamResponsesCol } from 'components/TeamResponses';

class CompletionTracking extends React.Component {
  render() {
    const { response } = this.props;
    const progress = response ? response.progress : 0;

    return (
      <Card.Content>
        <table>
          <tbody>
            <TeamResponsesRow>
              <TeamResponsesCol className="info">Progress</TeamResponsesCol>
              <TeamResponsesCol className="info">{progress}%</TeamResponsesCol>
              <TeamResponsesCol className="progress">
                <Progress percent={progress} showInfo={false} />
              </TeamResponsesCol>
            </TeamResponsesRow>
          </tbody>
        </table>
      </Card.Content>
    );
  }
}

const mapStateToProps = (state, props) => {
  // Because some of our data is coming in via context, our selectors cannot
  // access route params as usual (props.match.params). So we merge the others
  // into our props before passing that along to our selectors.
  const cycleId = props.cycle.uid;
  const moduleLabel = props.task.label;
  const cycleProps = {
    match: {
      params: {
        cycleId,
        moduleLabel,
      },
    },
  };
  const mergedProps = merge({}, props, cycleProps);

  return {
    response: selectors.responses.team.step.module.shared(state, mergedProps),
  };
};

export default compose(
  withCycleContext,
  withStepContext,
  withTaskContext,
  withMonoContext,
  connect(mapStateToProps),
)(CompletionTracking);
