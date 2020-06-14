import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import * as organizationsActions from 'state/organizations/actions';
import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';

import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import Loading from 'components/Loading';
import Modal from 'components/Modal';

import TeamOrganizationsList from './TeamOrganizationsList';

class TeamOrganizations extends React.Component {
  constructor(props) {
    super(props);

    this.state = { removingOrganization: null };
  }

  componentDidMount() {
    const { teamId } = fromParams(this.props);
    const { actions } = this.props;
    // @todo: this saga also gets related users and classrooms, which is
    // unnecessary here, and slows down the page. Break those apart and just
    // call each action explicitly when needed.
    actions.getTeam(teamId);
    actions.queryOrganizationsByTeam(teamId);
  }

  handleRequestRemove = removingOrganization => {
    // this.props.changeTeamForm('removingOrganization', orgId);
    this.setState({ ...this.state, removingOrganization });
  };

  handleCancelRemove = () => {
    // Clear the org staged for removal, which will also close the modal.
    this.setState({ ...this.state, removingOrganization: null });
  };

  handleConfirmRemove = () => {
    const { actions, team } = this.props;
    const { removingOrganization } = this.state;
    actions.removeTeamOrganization(team, removingOrganization.uid);
    this.handleCancelRemove();
  };

  render() {
    const { teamId } = fromParams(this.props);
    const {
      organizations,
      organizationsLoading,
      teamsLoading,
      teamsUpdating,
      hasCaptainPermission,
    } = this.props;

    const { removingOrganization } = this.state;

    const isLoading = organizationsLoading || teamsLoading;

    if (isLoading) {
      return <Loading />;
    }

    return (
      <>
        <TeamOrganizationsList
          handleRemoveOrganization={this.handleRequestRemove}
          isLoading={isLoading || teamsUpdating}
          mayEditOrganizations={hasCaptainPermission}
          organizations={organizations}
          teamId={teamId}
          toBack={routes.toTeamDetails(teamId)}
        />
        {removingOrganization && (
          <Modal title="Are You Sure?">
            <p>
              Are you sure you want to remove{' '}
              <em>{removingOrganization.name}</em> from this team?
            </p>
            <ButtonContainer horizontal>
              <Button cancel onClick={this.handleCancelRemove}>
                Keep
              </Button>
              <Button caution onClick={this.handleConfirmRemove}>
                Remove
              </Button>
            </ButtonContainer>
          </Modal>
        )}
      </>
    );
  }
}

TeamOrganizations.defaultProps = {
  organizations: [],
  team: {},
};

const mapStateToProps = (state, props) => ({
  hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
  organizations: selectors.team.organizations.list(state, props),
  organizationsLoading: selectors.loading.organizations(state, props),
  team: selectors.team(state, props),
  teamsLoading: selectors.loading.teams(state, props),
  teamsUpdating: selectors.updating.teams(state, props),
});

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...organizationsActions, // queryOrganizationsByTeam
        ...teamsActions, // updateTeam
      },
      dispatch,
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TeamOrganizations);
