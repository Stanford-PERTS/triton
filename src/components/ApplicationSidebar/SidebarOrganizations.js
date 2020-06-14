import React, { useContext } from 'react';
import * as routes from 'routes';
import fromParams from 'utils/fromParams';
import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import selectors from 'state/selectors';
import { query } from 'state/actions';

import TermsContext from 'components/TermsContext';
import Icon from 'components/Icon';
import MenuItem from 'components/MenuItem';
import MenuItemIcon from 'components/MenuItemIcon';
import MenuItemText from 'components/MenuItemText';
import MenuLink from 'components/MenuLink';
import MenuSideMenu from 'components/MenuSideMenu';
import Show from 'components/Show';

const SideBarOrganizations = props => {
  const { program } = props;
  const { organizationId } = fromParams(props);
  const terms = useContext(TermsContext);

  if (!program) {
    return null;
  }

  return (
    <MenuSideMenu>
      <MenuItem>
        <MenuLink
          to={routes.toOrganizationDetails(organizationId)}
          exact
          activeClassName="active"
        >
          <MenuItemIcon>
            <Icon names="gear" />
          </MenuItemIcon>
          <MenuItemText>Settings</MenuItemText>
        </MenuLink>
      </MenuItem>

      <MenuItem>
        <MenuLink
          to={routes.toOrganizationReports(organizationId)}
          activeClassName="active"
        >
          <MenuItemIcon>
            <Icon names="line-chart" />
          </MenuItemIcon>
          <MenuItemText>Reports</MenuItemText>
        </MenuLink>
      </MenuItem>

      <MenuItem>
        <MenuLink
          to={routes.toOrganizationTeams(organizationId)}
          activeClassName="active"
        >
          <MenuItemIcon>
            <Icon names="users" />
          </MenuItemIcon>
          <MenuItemText>{terms.teams}</MenuItemText>
        </MenuLink>
      </MenuItem>

      {/*
        Don't display for program's that don't utilize classrooms.
      */}
      <Show when={program && program.use_classrooms}>
        <MenuItem>
          <MenuLink
            to={routes.toOrganizationClassrooms(organizationId)}
            activeClassName="active"
          >
            <MenuItemIcon>
              <Icon names="graduation-cap" />
            </MenuItemIcon>
            <MenuItemText>{terms.classrooms}</MenuItemText>
          </MenuLink>
        </MenuItem>
      </Show>

      <MenuItem>
        <MenuLink
          to={routes.toOrganizationUsers(organizationId)}
          activeClassName="active"
        >
          <MenuItemIcon>
            <Icon names="users" />
          </MenuItemIcon>
          <MenuItemText>Administrators</MenuItemText>
        </MenuLink>
      </MenuItem>
    </MenuSideMenu>
  );
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ query }, dispatch),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      this.props.actions.query('programs');
    },
  }),
)(SideBarOrganizations);
