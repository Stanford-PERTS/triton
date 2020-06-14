import React from 'react';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import { bindActionCreators } from 'redux';
import { compose, defaultProps } from 'recompose';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withTermsContext } from 'components/TermsContext';

import formAction from 'state/form/emailSelected/actions';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import sel from 'state/selectors';
import { query } from 'state/actions';
import { slice as emailTemplatesSlice } from 'state/emailTemplates';
import { slice as usersSlice } from 'state/users';

import EmailPreview from './EmailPreview';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import InfoBox from 'components/InfoBox';
import Modal from 'components/Modal';
import Multicolumn from 'components/Multicolumn';
import SelectField from 'components/Form/SelectField';
import TextArea from 'components/Form/TextArea';

const WrappingLabel = styled.label`
  > * {
    margin: 0 10px;
  }
`;

const GroupNames = styled.ul`
  text-align: left;
`;

const emailSelectedFormName = 'emailSelected';

const validate = (values, props) => {
  const errors = {};

  errors.templateSlug = values.templateSlug
    ? null
    : 'Please choose a template.';

  return errors;
};

/**
 * Form to choose a template and send emails to users.
 * @class {React.Component}
 */
class EmailSelectedForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { captainOnly: false };
  }

  componentDidMount() {
    const { dispatchQuery } = this.props.actions;

    // Get the available templates.
    dispatchQuery(emailTemplatesSlice);

    // Also load users for all selected teams and orgs so we know their names
    // and email addresses. Include teams on any selected classrooms, so we can
    // get their contacts. Note that the results of these queries may include
    // more users than the selected recipients. That's okay, the point is just
    // to populate the store so that the selectors can return full user
    // entities.
    const { classrooms, teams, organizations } = this.props;
    const teamIds = new Set(teams.map(t => t.uid));
    for (const cl of classrooms) {
      teamIds.add(cl.team_id);
    }
    teamIds.forEach(teamId => {
      dispatchQuery(usersSlice, { byId: teamId });
    });
    organizations.forEach(org => {
      dispatchQuery(usersSlice, { byId: org.uid });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // Change which set of recipients are in the form based on the "captain
    // only" checkbox.
    const { change, allRecipients, captains } = this.props;
    const { captainOnly } = this.state;

    const recipientsChanging =
      !isEqual(prevProps.captains, captains) ||
      !isEqual(prevProps.allRecipients, allRecipients);
    const captainOnlyChanging = captainOnly !== prevState.captainOnly;

    if (recipientsChanging || captainOnlyChanging) {
      change(
        'recipientAddresses',
        captainOnly
          ? captains.map(u => u.email).join(',')
          : allRecipients.map(u => u.email).join(','),
      );
    }

    // If the form has been submitted and emails are posted, then form should
    // return to a pristine state.
    this.resetInitialValues(prevProps);
  }

  resetInitialValues(prevProps) {
    const { initialize, submitSucceeded, formValues } = this.props;
    if (!prevProps.submitSucceeded && submitSucceeded) {
      initialize(formValues);
    }
  }

  groupNames = () => {
    const {
      terms,
      teams,
      classrooms,
      organizations,
      individualUsers,
    } = this.props;

    return [
      ...teams.map(t => `${terms.team}: ${t.name}`),
      ...classrooms.map(c => `${terms.classroom}: ${c.name}`),
      ...organizations.map(o => `${terms.organization}: ${o.name}`),
      ...individualUsers.map(u => `User: ${u.name}`),
    ];
  };

  templateOptions = () => {
    const { emailTemplates } = this.props;
    const options = Object.values(emailTemplates).map(t => [
      t.slug,
      t.publish_name,
    ]);
    options.unshift([]); // blank first entry
    return options;
  };

  render() {
    const {
      allRecipients,
      captains,
      closeModal,
      emailTemplates,
      formValues: { templateSlug },
      program,
      terms,
      // redux-form
      handleSubmit,
      invalid,
      submitting,
    } = this.props;
    const { captainOnly } = this.state;
    const recipients = captainOnly ? captains : allRecipients;

    return (
      <Modal
        title={`Send Email to ${recipients.length} Users`}
        onBackgroundClick={closeModal}
        width={'80%'}
      >
        <form onSubmit={handleSubmit}>
          <Multicolumn>
            <Field
              name="templateSlug"
              label="Email template"
              options={this.templateOptions()}
              component={SelectField}
            />
            <WrappingLabel>
              {terms.team} {terms.captains.toLowerCase()} only
              <input
                type="checkbox"
                onChange={e => this.setState({ captainOnly: e.target.checked })}
              />
            </WrappingLabel>
          </Multicolumn>
          <GroupNames>
            {this.groupNames().map((name, i) => (
              <li key={`group-name-${i}`}>{name}</li>
            ))}
          </GroupNames>
          <Field
            name="recipientAddresses"
            component={TextArea}
            label={<span>Recipients ({recipients.length})</span>}
            readOnly
          />
          <h2>Preview</h2>
          <EmailPreview
            allUsers={recipients}
            template={emailTemplates[templateSlug]}
            program={program}
          />

          <FormSubmitButton
            disabled={invalid}
            handleSubmit={handleSubmit}
            submitting={submitting}
            submittingText="Saving Changes"
            data-test="submit"
          >
            Send {recipients.length} Emails
          </FormSubmitButton>

          <FormSubmitSucceeded form={emailSelectedFormName}>
            <InfoBox success>Emails sent.</InfoBox>
          </FormSubmitSucceeded>

          <FormSubmitFailed form={emailSelectedFormName}>
            {/* Using the error provided by redux-form-saga */}
          </FormSubmitFailed>
        </form>
      </Modal>
    );
  }
}

EmailSelectedForm.propTypes = {
  closeModal: PropTypes.func,
  // Required for selectors.
  searchForm: PropTypes.string,
};

const mapStateToProps = (state, props) => ({
  allRecipients: sel.search.selected.recipients.list(state, props),
  captains: sel.search.selected.associatedCaptains.list(state, props),
  classrooms: sel.search.selected.classrooms.list(state, props),
  emailTemplates: sel.emailTemplates.bySlug(state, props),
  formValues: sel.form.values(state, props),
  individualUsers: sel.search.selected.users.list(state, props),
  initialValues: {
    program: props.program,
    recipientAddresses: sel.search.selected.recipients
      .listProp('email')(state, props)
      .join(','),
  },
  organizations: sel.search.selected.organizations.list(state, props),
  teams: sel.search.selected.teams.list(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ dispatchQuery: query }, dispatch),
});

export default compose(
  // Set the form before connect() so form-based selectors work.
  defaultProps({ form: emailSelectedFormName }),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withTermsContext,
  reduxFormOnSubmit(formAction),
  reduxForm({
    // Necessary for `pristine` prop to update properly after form submit.
    enableReinitialize: true,
    validate,
  }),
)(EmailSelectedForm);
