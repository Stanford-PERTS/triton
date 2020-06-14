import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as cyclesActions from 'state/cycles/actions';
import { withMonoContext, withCycleContext } from 'programs/contexts';

import DeleteButton from 'components/DeleteButton';

const TaskInputDeleteCycle = props => {
  const { cycle } = props;
  const { removeCycle } = props.actions;

  return (
    <DeleteButton
      initialText="Are you sure you want to delete this cycle?"
      confirmationText="Once you delete this cycle there is no way to undo."
      onClick={() => removeCycle(cycle)}
    >
      Delete Cycle
    </DeleteButton>
  );
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(cyclesActions, dispatch),
});

export default compose(
  withMonoContext,
  withCycleContext,
  connect(
    null,
    mapDispatchToProps,
  ),
)(TaskInputDeleteCycle);
