import React from 'react';
import PropTypes from 'prop-types';
import withLoading, { withLoadingPropTypes } from 'utils/withLoading';
import { compose, setPropTypes, defaultProps } from 'recompose';

import Card from 'components/Card';
import Loading from 'components/Loading';

const Wrapper = ({ children, title }) => (
  <Card>
    <Card.Header dark>{title}</Card.Header>
    {children}
  </Card>
);

const Empty = () => (
  <Card.Content>
    <em>Nothing found.</em>
  </Card.Content>
);

const Render = ({ data, RowComponent }) => (
  <>
    {data.map(e => (
      <RowComponent key={e.uid} entity={e} />
    ))}
  </>
);

export const propTypes = {
  ...withLoadingPropTypes,
  data: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string,
};

export default compose(
  setPropTypes(propTypes),
  defaultProps({
    data: [],
  }),
  withLoading({
    WrapperComponent: Wrapper,
    WhenLoadingComponent: Loading,
    WhenEmptyComponent: Empty,
  }),
)(Render);
