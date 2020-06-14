import PropTypes from 'prop-types';
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';

import Loading from 'components/Loading';
import TeamsListEmpty from './TeamsListEmpty';
import TeamsListRender from './TeamsListRender';
import TeamsListWrapper from './TeamsListWrapper';

export const propTypes = {
  ...withLoadingPropTypes,
  location: PropTypes.object,
  Menu: PropTypes.func,
  newTeamRoute: PropTypes.string,
  program: PropTypes.object,
  teams: PropTypes.arrayOf(PropTypes.object),
  teamsLinks: PropTypes.string,
  title: PropTypes.string,
  user: PropTypes.object,
};

// TeamsList (default, from Home)
export default compose(
  setDisplayName('TeamsList'),
  setPropTypes(propTypes),
  defaultProps({
    teams: [],
    user: {},
  }),
  withLoading({
    WrapperComponent: TeamsListWrapper,
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: TeamsListEmpty,
  }),
)(TeamsListRender);

// TeamsList (from OrganizationTeams)
// The only difference between the default export TeamsList and this version is
// that here we are assuming `teams` and `user` is already available at the time
// this component mounts, so we won't use idle/loading states.
export const OrganizationTeamsList = compose(
  setDisplayName('TeamsList'),
  setPropTypes(propTypes),
  defaultProps({
    teams: [],
    user: {},
  }),
  withLoading({
    WrapperComponent: TeamsListWrapper,
    WhenEmptyComponent: TeamsListEmpty,
  }),
)(TeamsListRender);
