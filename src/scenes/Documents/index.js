import React from 'react';
import { compose, lifecycle } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';

import { getTeamOnly as getTeamOnlyCreator } from 'state/teams/actions';
import { query as queryCreator } from 'state/actions';

import Card from 'components/Card';
import { ProgramDocumentsIndex } from 'programs';

const Documents = ({ program }) => {
  if (!program) {
    return null;
  }

  const ProgramDocumentsContent = ProgramDocumentsIndex[program.label];
  if (!ProgramDocumentsContent) {
    return null;
  }

  return (
    <Card>
      <Card.Header dark>Documents</Card.Header>

      <Card.Content>
        <ProgramDocumentsContent />
      </Card.Content>
    </Card>
  );
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    { query: queryCreator, getTeamOnly: getTeamOnlyCreator },
    dispatch,
  ),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { getTeamOnly, query } = this.props.actions;
      const { teamId } = fromParams(this.props);
      getTeamOnly(teamId);
      query('programs');
    },
  }),
)(Documents);
