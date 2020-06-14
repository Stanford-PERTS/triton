import React from 'react';
import omit from 'lodash/omit';
import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { getFormValues, isDirty } from 'redux-form';
import { withRouter } from 'react-router-dom';

import * as responsesActions from 'state/responses/actions';
import * as routes from 'routes';
import BeforeUnloadAndNavPrompt from 'components/BeforeUnloadAndNavPrompt';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import withLoading from 'utils/withLoading';

import Loading from 'components/Loading';

const TaskModuleRender = props => {
  const { parentLabel, stepType, teamId } = fromParams(props);
  const { dirty, ResponseForm } = props;

  const toBack = routes.toProgramStep(teamId, stepType, parentLabel);

  const responseFormProps = omit(props, [
    'actions',
    'ResponseForm',
    'setHasDisplayLoading',
    'setIdleStatus',
  ]);

  return (
    <>
      <BeforeUnloadAndNavPrompt when={dirty} />
      <ResponseForm toBack={toBack} {...responseFormProps} />
    </>
  );
};

const mapStateToProps = (state, props) => {
  const { stepType, moduleLabel } = fromParams(props);

  let isLoading =
    selectors.loading.cycles(state, props) ||
    selectors.loading.responses(state, props);

  if (stepType === 'cycle') {
    // Wait for this cycle to load, which otherwise doesn't apply.
    isLoading = isLoading || !selectors.cycle(state, props);
  }

  return {
    formValues: getFormValues(state, { form: moduleLabel }),
    dirty: isDirty(moduleLabel)(state),
    isLoading,
    // TODO, why does `selectors.auth.user` not return the user in time here?
    user: state.auth.user,
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(responsesActions, dispatch),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidMount() {
      const { teamId } = fromParams(this.props);
      const { queryResponsesByTeam } = this.props.actions;

      queryResponsesByTeam(teamId);
    },
  }),
  withLoading({
    WhenIdleComponent: Loading,
    WhenInitialLoadingComponent: Loading,
  }),
)(TaskModuleRender);
