import React from 'react';
import { compose, defaultProps } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import * as cyclesActions from 'state/cycles/actions';
import { withMonoContext } from 'programs/contexts';

import AddCycleButton from 'components/AddCycleButton';
import Show from 'components/Show';

const ProgramMenuAddCycles = props => {
  const { cycles, hasCaptainPermission, program } = props;
  const { teamId } = fromParams(props);

  const handleAddCycle = () => {
    const { addCycle } = props.actions;

    addCycle({ team_id: teamId });
  };

  const atMaxCycles = program.max_cycles <= cycles.length;
  const maxCyclesEqualsMinCycles = program.max_cycles === program.min_cycles;

  return (
    <Show when={hasCaptainPermission && !maxCyclesEqualsMinCycles}>
      <AddCycleButton
        disabled={atMaxCycles}
        disabledText={
          <span>
            This program is limited to a maximum of {program.max_cycles} cycles.
          </span>
        }
        onClick={handleAddCycle}
      />
    </Show>
  );
};

const mapStateToProps = (state, props) => ({
  hasCaptainPermission: selectors.auth.user.hasCaptainPermission(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...cyclesActions }, dispatch),
});

export default compose(
  withRouter,
  withMonoContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  defaultProps({
    cycles: [],
  }),
)(ProgramMenuAddCycles);
