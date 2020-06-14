import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as responsesActions from 'state/responses/actions';
import * as cyclesActions from 'state/cycles/actions';
import * as uiActions from 'state/ui/actions';
import * as routes from 'routes';
import selectors from 'state/selectors';

import Button from 'components/Button';
import Card from 'components/Card';
import IconComplete from 'components/IconComplete';
import TaskCaptainOnlyStyled from './TaskCaptainOnly';
import { submitButtonModule } from './TaskButtonModule';

class TaskCycleCreateAndAdvance extends React.Component {
  isComplete() {
    const { response } = this.props;
    const progress = (response && response.progress) || 0;
    return progress === 100;
  }

  createCycleAndAdvance = () => {
    const { cycle, cycles, team } = this.props;
    const { addCycle, redirectTo } = this.props.actions;

    if (!this.isComplete()) {
      submitButtonModule(this.props);
    }

    const nextCycle = cycles.find(c => c.ordinal === cycle.ordinal + 1);
    if (nextCycle) {
      // Navigate to it.
      redirectTo(
        routes.toProgramStep(nextCycle.team_id, 'cycle', nextCycle.uid),
      );
    } else {
      // Create another cycle if this is the last. The cycle saga will redirect
      // to the new cycle
      addCycle({ team_id: team.uid });
    }
  };

  markIncomplete = () => submitButtonModule(this.props);

  render() {
    const { isUpdating, task } = this.props;
    const complete = this.isComplete();

    return (
      <Card>
        <Card.Header
          task
          left={<IconComplete complete={complete} />}
          right={<TaskCaptainOnlyStyled />}
        >
          {task.title}
        </Card.Header>
        <Card.Content>
          {complete ? (
            <>
              <p>
                This cycle has been marked complete and you&rsquo;re on to the
                next one. Great work!
              </p>
              <Button cancel onClick={this.markIncomplete} loading={isUpdating}>
                Mark Incomplete
              </Button>
            </>
          ) : (
            <>
              <p>
                When you&rsquo;re done with this cycle, start the next one to
                keep surveying and improving!
              </p>
              <Button onClick={this.createCycleAndAdvance} loading={isUpdating}>
                Complete Cycle and Start Next
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    );
  }
}

const mapStateToProps = (state, props) => ({
  isUpdating: selectors.updating.responses(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    { ...cyclesActions, ...responsesActions, ...uiActions },
    dispatch,
  ),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(TaskCycleCreateAndAdvance);
