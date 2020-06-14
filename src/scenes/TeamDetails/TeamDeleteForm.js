import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';

import ErrorField from 'components/Form/ErrorField';
import FormActions from 'components/Form/FormActions';
import TermsContext from 'components/TermsContext';

const TeamDeleteForm = props => (
  <form onSubmit={props.handleSubmit(props.onSubmit)}>
    <FormActions
      deleting={props.deleting}
      displayEntity={useContext(TermsContext).team}
      form="team"
      handleDelete={props.handleDelete}
      mayDelete={props.mayDelete}
      mode="update"
    />
    <Field name="_form" component={ErrorField} />
  </form>
);

TeamDeleteForm.propTypes = {
  deleting: PropTypes.bool.isRequired,
  form: PropTypes.string.isRequired,
  handleDelete: PropTypes.func.isRequired,
  mayDelete: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default reduxForm({ form: 'teamDelete' })(TeamDeleteForm);
