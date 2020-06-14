import React from 'react';
import { compose } from 'recompose';
import { withRouter, Route } from 'react-router-dom';
import fromParams from 'utils/fromParams';
import * as routes from 'routes';

const StepTaskModule = ({ children }) => (
  <Route
    path={routes.toProgramModule()}
    render={renderProps => {
      const { moduleLabel } = fromParams(renderProps);
      const childrenArray = React.Children.toArray(children);
      const task = childrenArray.find(t => t.props.label === moduleLabel);
      return task ? task : <div>Task with label {moduleLabel} not found.</div>;
    }}
  />
);

export default compose(withRouter)(StepTaskModule);
