import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import selectors from 'state/selectors';
import { withTermsContext } from 'components/TermsContext';

import BackButton from 'components/BackButton';
import Loading from 'components/Loading';
import TeamSettings from 'scenes/TeamSettings';

class TeamDetails extends React.Component {
  onSubmit = () => {
    const { program, teamFormValues: team } = this.props;
    const { addTeam } = this.props.actions;
    addTeam({ program_id: program.uid, ...team });
  };

  render() {
    const { addError, isAdding, isLoading, program, terms } = this.props;
    const toBack = program
      ? routes.toHome(program.label)
      : routes.toHomeNoProgram();

    return isLoading ? (
      <Loading />
    ) : (
      <TeamSettings
        dark={true}
        addError={addError}
        left={<BackButton to={toBack} label="Cancel" />}
        loading={isAdding}
        onSubmit={this.onSubmit}
        teamMode="add"
        title={`Set up your ${terms.team}`}
      />
    );
  }
}

const mapStateToProps = (state, props) => ({
  addError: selectors.error.teams(state),
  isAdding: selectors.adding.hoa(teamsActions.addTeam())(state, props),
  // to make sure terms aren't empty strings, otherwise ui shfits
  isLoading: selectors.loading.programs(state, props),
  program: selectors.program(state, props),
  teamFormValues: selectors.form.values(state, { form: 'team' }),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...teamsActions }, dispatch),
});

export default compose(
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(TeamDetails);
