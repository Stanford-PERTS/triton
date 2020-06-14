import React, { useState } from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { reduxForm, startSubmit } from 'redux-form';
import styled, { css } from 'styled-components';
import { toProgramModulePage, toProgramStep } from 'routes';
import * as uiActions from 'state/ui/actions';
import selectors from 'state/selectors';
import fromParams from 'utils/fromParams';
import map from 'lodash/map';

import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Link from 'components/Link';
import Modal from 'components/Modal';
import Show from 'components/Show';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  > :not(:last-child) {
    margin-right: 40px;
  }

  ${props =>
    props.grow &&
    css`
      flex-grow: 1;
    `};

  button {
    width: initial;
  }
`;

const PagesNavigation = props => {
  const [showModal, setShowModal] = useState(false);

  const {
    teamId,
    parentLabel,
    stepType,
    moduleLabel,
    page,
    totalPages,
  } = fromParams(props);

  const onCompletionPage = page === totalPages;

  const {
    // provided by the Pages component
    form,
    handleSubmit,
    onSubmit,
    // form related
    dirty,
    dispatch,
    formValues,
    invalid,
    pristine,
    initialFormValues,
    initialize,
    submitting,
    touch,
    valid,
    visibleFields,
  } = props;

  const { redirectTo } = props.actions;

  const redirectPrevPage = () => {
    redirectTo(
      toProgramModulePage(
        teamId,
        stepType,
        parentLabel,
        moduleLabel,
        page - 1,
        totalPages,
      ),
    );
  };

  const resetAndGotoPrevPage = () => {
    // Re-initialize the form back to initialFormValues so that any input
    // changes made on the current page of the form do not get submitted if the
    // user submits from a previous page.
    initialize(initialFormValues);

    redirectPrevPage();

    setShowModal(false);
  };

  const gotoPrevPage = () => {
    // If the user hasn't altered any of the fields on the current page, we
    // can allow them to navigate back, even if some of the fields are invalid
    // (because they are required).
    if (pristine) {
      resetAndGotoPrevPage();

      return;
    }

    // If the user has altered something on the current page, and what they've
    // done so far is valid, we can save their changes and allow them to
    // navigate back.
    if (dirty && valid) {
      // Since we're not submitting the form via a form submit, we have to
      // manually dispatch the startSubmit action like handleSubmit would.
      // https://redux-form.com/8.2.1/docs/api/actioncreators.md
      dispatch(startSubmit(form));

      onSubmit(
        {
          ...formValues,
          _routeAfterSuccess: 'prev',
        },
        dispatch,
        props,
      );

      return;
    }

    // If the user has altered something on the current page, but what they've
    // done so far is invalid, then pop a modal and ask the user how they'd like
    // to handle.
    //
    // Note: We can't base this on only the touched fields because it's possible
    // to have default values for input fields that are invalid. This probably
    // isn't good survey design, but it is possible, so we should never allow
    // invalid fields to be submitted.
    if (dirty && invalid) {
      // Touch all of the visible form fields so that any of the syncErrors
      // will be displayed. This will allow the user that wants to close the
      // modal and fix to see which fields need their attention.
      touch(...map(visibleFields, field => field.name));

      setShowModal(true);
    }
  };

  const handleSubmitThenNext = handleSubmit(() =>
    // handleSubmit provides formValues, dispatch, and props, but since we
    // already need to bring them into our component via props, we won't bring
    // them in again here to avoid shadowing.
    onSubmit(
      {
        ...formValues,
        _routeAfterSuccess: 'next',
      },
      dispatch,
      props,
    ),
  );

  return (
    <>
      <Show when={showModal}>
        <Modal title="You have unsaved responses">
          It looks like you&rsquo;re not done with this page. Would you like to
          discard your changes, or stay here and fix them?
          <ButtonContainer>
            <Button onClick={() => resetAndGotoPrevPage()}>
              Discard Changes &amp; Go to Previous Page
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Stay Here &amp; Fix
            </Button>
          </ButtonContainer>
        </Modal>
      </Show>

      <Card.Content>
        <Show when={totalPages === 1}>
          <FormSubmitButton
            disabled={invalid}
            handleSubmit={handleSubmit}
            submitting={submitting}
            submittingText="Submitting"
            data-test="submit"
          >
            Submit
          </FormSubmitButton>

          <FormSubmitSucceeded form={form}>
            <InfoBox success>Your response has been saved.</InfoBox>
          </FormSubmitSucceeded>
          <FormSubmitFailed form={form} handleSubmit={handleSubmitThenNext} />
        </Show>

        <Show when={totalPages > 1}>
          <Show when={!onCompletionPage}>
            <FlexRow>
              <Button
                disabled={page === 1}
                loading={submitting}
                onClick={gotoPrevPage}
                data-test="prev"
              >
                Previous
              </Button>

              <FormSubmitButton
                disabled={invalid}
                handleSubmit={handleSubmitThenNext}
                submitting={submitting}
                submittingText="Next"
                data-test="submit"
              >
                Next
              </FormSubmitButton>
            </FlexRow>
            <FormSubmitFailed form={form} handleSubmit={handleSubmitThenNext} />
          </Show>

          <Show when={onCompletionPage}>
            <FlexRow>
              <Button onClick={gotoPrevPage} data-test="prev">
                Previous
              </Button>

              <Link to={toProgramStep()}>
                <Button data-test="to-task-list">Back To Task List</Button>
              </Link>
            </FlexRow>
          </Show>
        </Show>
      </Card.Content>
    </>
  );
};

const mapStateToProps = (state, props) => ({
  initialFormValues: selectors.form.initial(state, props),
  // redux-form clobbers the values prop, so we can't user it, but unfortunately
  // doesn't actually pass the form values through it, so instead let's use
  // formValues.
  formValues: selectors.form.values(state, props),
  // redux-form clobbers the registeredFields prop, so we can't use it, but
  // unfortunately doesn't actually pass anything using it, so instead let's
  // use visibleFields.
  visibleFields: selectors.form.registeredFields(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(uiActions, dispatch),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  reduxForm(),
)(PagesNavigation);
