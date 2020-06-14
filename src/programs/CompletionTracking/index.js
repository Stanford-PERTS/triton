import React from 'react';
import merge from 'lodash/merge';
import selectors from 'state/selectors';
import styled from 'styled-components';
import { compose, branch, renderNothing } from 'recompose';
import { connect } from 'react-redux';
import { withCycleContext } from 'programs/contexts';
import { withRouter } from 'react-router-dom';
import { withTermsContext } from 'components/TermsContext';

import { Progress } from 'antd';
import Card from 'components/Card';
import FakeLink from 'components/FakeLink';
import TeamResponses from 'components/TeamResponses';

const CompletionTrackingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CompletionTrackingLabel = styled.div`
  font-weight: 600;
`;

const CompletionTrackingProgressContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
`;

const CompletionTrackingProgressBarContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;

  > :not(:last-child) {
    margin-right: 8px;
  }
`;

const CompletionTrackingView = styled.div`
  margin-left: 8px;
`;

const CompletionTrackingResponses = styled.div``;

class CompletionTracking extends React.Component {
  constructor() {
    super();
    this.state = {
      teamResponsesOpen: false,
    };
  }

  toggleTeamResponses = () =>
    this.setState({
      teamResponsesOpen: !this.state.teamResponsesOpen,
    });

  isCycleActive = () => {
    const { cycle, currentCycle } = this.props;
    return cycle && currentCycle && cycle.uid === currentCycle.uid;
  };

  render() {
    const {
      teamResponsesPercent,
      teamResponses,
      teamUsers,
      terms,
    } = this.props;

    return (
      <Card.Content>
        <CompletionTrackingContainer>
          <CompletionTrackingLabel>
            {teamResponsesPercent}% {terms.members} Completed
          </CompletionTrackingLabel>
          <CompletionTrackingProgressContainer>
            <CompletionTrackingProgressBarContainer>
              <div>0%</div>
              <Progress percent={teamResponsesPercent} showInfo={false} />
              <div>100%</div>
            </CompletionTrackingProgressBarContainer>
            <CompletionTrackingView>
              <FakeLink onClick={this.toggleTeamResponses}>
                {this.state.teamResponsesOpen ? 'Hide' : 'View'}
              </FakeLink>
            </CompletionTrackingView>
          </CompletionTrackingProgressContainer>
          {this.state.teamResponsesOpen && (
            <CompletionTrackingResponses>
              <TeamResponses
                teamResponses={teamResponses}
                teamUsers={teamUsers}
              />
            </CompletionTrackingResponses>
          )}
        </CompletionTrackingContainer>
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
    hasCaptainPermission: selectors.auth.user.hasCaptainPermission(
      state,
      props,
    ),
    currentCycle: selectors.team.cycles.current(state, props),
    teamResponsesPercent: selectors.responses.team.step.module.percentComplete(
      state,
      mergedProps,
    ),
    teamResponses: selectors.responses.team.step.module.list(
      state,
      mergedProps,
    ),
    teamUsers: selectors.team.users.list(state, props),
  };
};

export default compose(
  withRouter,
  withCycleContext,
  withTermsContext,
  connect(mapStateToProps),
  branch(({ hasCaptainPermission }) => !hasCaptainPermission, renderNothing),
)(CompletionTracking);
