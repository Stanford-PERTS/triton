import React from 'react';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import fromParams from 'utils/fromParams';
import * as organizationsActions from 'state/organizations/actions';
import {
  clearOptionWatcher,
  startOptionWatcher,
} from 'state/dashboard/actions';
import selectors from 'state/selectors';

import { RenderChildrenWithContext } from 'programs/contexts';
import OrganizationDashboardOptions from './OrganizationDashboardOptions';
import OrganizationDashboardTable from './OrganizationDashboardTable';
import PagesNav from './PagesNav';
import ProgramDataForSummary from 'programs/ProgramData/ProgramDataForSummary';
import ProgramDisplay from 'programs';
import Card from 'components/Card';

const formName = 'organizationDashboard';

const OrganizationDashboard = props => {
  const { dashboardTotalPages, formValues, teams, teamIdsToDisplay } = props;

  const onClickPage = page => {
    const { change } = props;
    change('page', page);
  };

  return (
    <>
      <Card>
        <Card.Header dark>Dashboard</Card.Header>
        <OrganizationDashboardOptions />
        <Card.Content>
          <PagesNav
            numberOfPages={dashboardTotalPages}
            currentPage={formValues.page}
            onClick={onClickPage}
          />

          <OrganizationDashboardTable>
            <tbody>
              <tr>
                <th>Team</th>
                <th>Stage</th>
                <th>Task</th>
                <th>Responsible</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>

              {/*
                Summary will render the visible rows. These rows will be
                filtered based on the page (teams) and on any filter/search that
                the user chooses via the dashboard options ui.
              */}
              <RenderChildrenWithContext display="summary">
                {teams
                  .filter(team => teamIdsToDisplay.includes(team.uid))
                  .map(team => (
                    <ProgramDataForSummary key={team.uid} teamId={team.uid}>
                      <ProgramDisplay teamId={team.uid} />
                    </ProgramDataForSummary>
                  ))}
              </RenderChildrenWithContext>

              {/*
                SummaryEmitter will not render anything visible to the user.
                Instead we are using this to mount all rows so that they can
                dispatch DASHBOARD_ADD_TASK actions, which will populate the
                dashboard options drop down.
              */}
              <RenderChildrenWithContext display="summaryEmitter">
                {teams.map(team => (
                  <ProgramDataForSummary key={team.uid} teamId={team.uid}>
                    <ProgramDisplay teamId={team.uid} />
                  </ProgramDataForSummary>
                ))}
              </RenderChildrenWithContext>
            </tbody>
          </OrganizationDashboardTable>

          <PagesNav
            numberOfPages={dashboardTotalPages}
            currentPage={formValues.page}
            onClick={onClickPage}
          />
        </Card.Content>
      </Card>
      {/* Overrides the max-width set in components/ApplicationWrapper. */}
      <style>{'.MainContent { max-width: 1200px }'}</style>
    </>
  );
};

const mapStateToProps = (state, props) => ({
  dashboardTotalPages: selectors.dashboard.totalPages(state, props),
  formValues: selectors.form.values(state, {
    ...props,
    form: formName,
  }),
  teams: selectors.organization.teams.list(state, props),
  teamIdsToDisplay: selectors.dashboard.teamIdsToDisplay(state, {
    ...props,
    form: formName,
  }),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(organizationsActions, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      startOptionWatcher();

      const { organizationId } = fromParams(this.props);
      const { queryOrganizationDashboard } = this.props.actions;
      queryOrganizationDashboard(organizationId);
    },
    componentWillUnmount() {
      // Don't leave the interval running if we navigate away before it self
      // clears itself.
      clearOptionWatcher();
    },
  }),
  reduxForm({
    form: formName,
  }),
)(OrganizationDashboard);
