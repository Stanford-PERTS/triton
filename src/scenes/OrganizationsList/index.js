import PropTypes from 'prop-types';
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';

import Loading from 'components/Loading';
import OrganizationsListWrapper from './OrganizationsListWrapper';
import OrganizationsListEmpty from './OrganizationsListEmpty';
import OrganizationsListRender from './OrganizationsListRender';

export const propTypes = {
  ...withLoadingPropTypes,
  isLoadingTeams: PropTypes.bool,
  organizations: PropTypes.arrayOf(PropTypes.object),
  organizationsLinks: PropTypes.string,
};

export default compose(
  setDisplayName('OrganizationsList'),
  setPropTypes(propTypes),
  defaultProps({
    organizations: [],
  }),
  withLoading({
    WrapperComponent: OrganizationsListWrapper,
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: OrganizationsListEmpty,
  }),
)(OrganizationsListRender);
