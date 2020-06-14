import formActionDefault from 'state/form/TaskModule/actions';
import pick from 'lodash/pick';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import { bodyToFormValues } from 'state/responses/helpers';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import selectors from 'state/selectors';

const withReduxFormForResponses = ({
  form = undefined,
  formAction = formActionDefault,
  type,
}) => BaseComponent =>
  compose(
    withRouter,
    // Allow passing in supplemental `initialValues` to the task module form.
    // Any values passed will override existing response values, so this is
    // mostly useful for values that won't be updated by the user, hidden values
    // like `is_captain`.
    connect((state, props) => {
      // Convert compound body (with timestamps) to {key: value} for the form.
      const responseBody = (props.response && props.response.body) || {};
      const existingValues = bodyToFormValues(responseBody);
      // Filter all values in the response to those for fields on this page.
      const visibleFields =
        selectors.form.registeredFields(state, {
          form,
          ...props,
        }) || {};
      const visibleValues = pick(existingValues, Object.keys(visibleFields));

      const initialValues = props.initialValues || {};

      return {
        initialValues: {
          ...visibleValues,
          ...initialValues,
        },
      };
    }),
    reduxFormOnSubmit(formAction, {
      propsToInclude: ['task', 'team', 'response', 'match'],
    }),
    reduxForm({
      form,
      enableReinitialize: true,
    }),
  )(BaseComponent);

export default withReduxFormForResponses;
