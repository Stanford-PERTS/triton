import React from 'react';
import styled from 'styled-components';
import theme from 'components/theme';
import { compose, setDisplayName } from 'recompose';
// Our custom Link adds considerable load time to the summary report when large
// numbers of rows are displayed and we don't need the custom features.
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import * as routes from 'routes';
import {
  withCycleContext,
  withMonoContext,
  withStepContext,
} from 'programs/contexts';
import some from 'lodash/some';

export const TableRow = styled.tr`
  td {
    padding: 8px;
    border: 1px solid ${theme.palette.gray};

    color: ${theme.palette.darkGray};

    a {
      color: ${theme.palette.primary};
    }
  }

  &.hide {
    display: none;
  }
`;

const StepSummary = props => {
  const {
    children,
    dashboardFiltered,
    dashboardSearchBy,
    cycle,
    step,
    team,
  } = props;

  const childrenArr = React.Children.toArray(children);

  // Note: We are filtering out non-reportable and tasks that shouldn't be
  // displayed based on showInCycle here. This will prevent these tasks from
  // entering the `dashbord` slice of our store to keep them out of our search
  // and filter.

  // Filter tasks tagged with `reportable` in config file.
  let tasks = childrenArr.filter(t => t.props.reportable);

  // Filter tasks with showInCycle matching current cycle.
  tasks = tasks.filter(t => {
    if (t.props.showInCycle) {
      return parseInt(t.props.showInCycle, 10) === cycle.ordinal;
    }

    return true;
  });

  // Note: We are only hiding (display: none) tasks that shouldn't be displayed
  // based on user search and filter. This allows them to still register
  // themselves in the `dashboard` slice of our store even though they might
  // not be visually displayed.

  // We don't need the dashboardSearchBy, we are only using it to determine if
  // the user has entered a valid search. We don't want to filter immediately
  // because the full set of tasks need to render so that they can dispatch
  // actions to register themselves in the redux store to allow us to search.
  if (dashboardSearchBy) {
    tasks = tasks.map(t => {
      const taskMatchesFilter = some(dashboardFiltered, d => {
        const [teamId, stepParentLabel, taskLabel] = d.key.split(':');
        return (
          team.uid === teamId &&
          step.parentLabel === stepParentLabel &&
          t.props.label === taskLabel
        );
      });

      if (taskMatchesFilter) {
        return t;
      }

      return React.cloneElement(t, { hide: true });
    });
  }

  return tasks.map(task => (
    <TableRow key={task.key} className={task.props.hide ? 'hide' : ''}>
      <td className="first">
        <Link to={routes.toTeam(team.uid)}>{team.name}</Link>
      </td>

      <td className="first">
        <Link to={routes.toProgramStep(team.uid, step.type, step.parentLabel)}>
          {step.name}
        </Link>
      </td>
      {task}
    </TableRow>
  ));
};

const mapStateToProps = (state, props) => ({
  dashboardSearchBy: selectors.dashboard.search.by(state, {
    form: 'organizationDashboard',
  }),
  dashboardFiltered: selectors.dashboard.filtered(state, {
    form: 'organizationDashboard',
  }),
});

export default compose(
  withMonoContext,
  withStepContext,
  withCycleContext,
  connect(mapStateToProps),
  setDisplayName('StepSummary'),
)(StepSummary);
