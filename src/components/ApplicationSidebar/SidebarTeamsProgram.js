import React from 'react';
import { compose, defaultProps } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';

import { RenderChildrenWithContext } from 'programs/contexts';
import ProgramData from 'programs/ProgramData';
import ProgramDisplay from 'programs';
import MenuSubMenu from 'components/MenuSubMenu';

const SideBarTeamsProgram = ({ team }) => (
  <RenderChildrenWithContext display="menu">
    <MenuSubMenu>
      <ProgramData teamId={team.uid}>
        <ProgramDisplay teamId={team.uid} />
      </ProgramData>
    </MenuSubMenu>
  </RenderChildrenWithContext>
);

const mapStateToProps = (state, props) => ({
  team: selectors.team(state, props),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
  defaultProps({
    team: {},
  }),
)(SideBarTeamsProgram);
