import PropTypes from 'prop-types';
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';

import ClassroomsListEmpty from './ClassroomsListEmpty';
import ClassroomsListRender from './ClassroomsListRender';
import ClassroomsListWrapper from './ClassroomsListWrapper';
import Loading from 'components/Loading';

export const propTypes = {
  ...withLoadingPropTypes,
  classrooms: PropTypes.arrayOf(PropTypes.object),
  newClassroomRoute: PropTypes.string,
  teamId: PropTypes.string,
  title: PropTypes.string,
};

export default compose(
  setDisplayName('ClassroomsList'),
  setPropTypes(propTypes),
  defaultProps({
    classrooms: [],
  }),
  withLoading({
    WrapperComponent: ClassroomsListWrapper,
    WhenIdleComponent: Loading,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: ClassroomsListEmpty,
  }),
)(ClassroomsListRender);
