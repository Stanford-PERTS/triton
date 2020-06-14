import React from 'react';
import { compose, defaultProps } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import { withTermsContext } from 'components/TermsContext';

import BackButton from 'components/BackButton';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import TeamDeleteForm from './TeamDeleteForm';
import TeamSettings from 'scenes/TeamSettings';

class TeamDetails extends React.Component {
  componentDidMount() {
    const { getTeam } = this.props.actions;
    const { teamId } = fromParams(this.props);
    getTeam(teamId);
  }

  onSubmit = () => {
    const { teamFormValues: team } = this.props;
    const { updateTeam } = this.props.actions;
    if (typeof team.target_group_name === 'string') {
      team.target_group_name = team.target_group_name.trim();
    }
    updateTeam(team);
  };

  handleRemoveTeam = () => {
    const { team } = this.props;
    const { removeTeam } = this.props.actions;
    removeTeam(team);
  };

  render() {
    const {
      hasCaptainPermission,
      isDeleting,
      isLoading,
      program,
      team,
      terms,
    } = this.props;

    return (
      <>
        {hasCaptainPermission && (
          <TeamSettings
            dark={true}
            initialValues={team}
            left={<BackButton to={routes.toTeam(team.uid)} />}
            loading={isLoading}
            onSubmit={this.onSubmit}
            targetGroupEnabled={program.target_group_enabled}
            teamMode="update"
            title={`${terms.team} Settings`}
          />
        )}

        <Section
          title={
            hasCaptainPermission ? 'Other Settings' : `${terms.team} Settings`
          }
          dark={!hasCaptainPermission}
        >
          <SectionItem to={routes.toTeamSurvey(team.uid)}>
            Survey Settings
          </SectionItem>
          <SectionItem to={routes.toTeamUsers(team.uid)}>
            {terms.team} Members
          </SectionItem>
          {hasCaptainPermission && (
            <>
              <SectionItem to={routes.toTeamOrganizations(team.uid)}>
                Associated {terms.organizations}
              </SectionItem>
              <SectionItem to={routes.toTeamReportsSettings(team.uid)}>
                Report Settings
              </SectionItem>
            </>
          )}
        </Section>

        {hasCaptainPermission && (
          <TeamDeleteForm
            deleting={isDeleting}
            form="teamDelete"
            handleDelete={this.handleRemoveTeam}
            mayDelete={hasCaptainPermission}
            onSubmit={this.onSubmit}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  team: selectors.team(state, props),
  teamFormValues: selectors.form.values(state, { form: 'team' }),
  isLoading:
    selectors.loading.teams(state, props) ||
    selectors.updating.teams(state, props),
  isDeleting: selectors.deleting.team(state, props),
  hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
  program: selectors.program(state, props),
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
  defaultProps({
    team: {},
    program: {},
  }),
)(TeamDetails);
