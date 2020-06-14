import isEmpty from 'lodash/isEmpty';
import React from 'react';
import uri from 'urijs';
import { bindActionCreators } from 'redux';
import { isDirty } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as metricsActions from 'state/metrics/actions';
import * as routes from 'routes';
import * as surveysActions from 'state/surveys/actions';
import * as teamsActions from 'state/teams/actions';
import fromParams from 'utils/fromParams';
import selectors from 'state/selectors';
import { getSurveyParams } from 'services/triton/surveys';

import { formName } from './config';
import SurveyFormComponent from './SurveyFormComponent';
import BackButton from 'components/BackButton';
import Card from 'components/Card';
import Link from 'components/Link';
import Loading from 'components/Loading';

import './styles.css';

export const handleSurveyFormSubmit = ({
  actions,
  survey,
  surveyFormValues,
}) => {
  const activeMetricIds = surveyFormValues.metrics
    .filter(m => m.metricActive)
    .map(m => m.uid);

  const activeOpenResponseIds = surveyFormValues.metrics
    .filter(m => m.metricActive && m.openResponsesActive)
    .map(m => m.uid);

  const updatedSurvey = {
    ...survey,
    interval: surveyFormValues.interval,
    metrics: activeMetricIds,
    open_responses: activeOpenResponseIds,
    meta: {
      ...survey.meta,
      ...surveyFormValues.meta,
    },
  };

  actions.updateSurvey(updatedSurvey);
};

class Survey extends React.Component {
  componentDidMount() {
    const { teamId } = fromParams(this.props);
    const { getAllMetrics, getTeam, queryTeamSurveys } = this.props.actions;

    queryTeamSurveys(teamId);
    getAllMetrics();
    getTeam(teamId);
  }

  handleSubmit = () => handleSurveyFormSubmit(this.props);

  getFirstLink(metric) {
    const links = metric.links || [];
    const link = links[0] || {};
    return link.url || 'https://perts.net/conditions';
  }

  render() {
    const {
      formIsDirty,
      hasCaptainPermission,
      isLoading,
      program,
      programMetrics,
      survey,
    } = this.props;
    const { teamId } = fromParams(this.props);

    if (isLoading) {
      return <Loading />;
    }

    // If this function changes, you probably also need to change the duplicate
    // function in src/programs/SurveyPreviewLink.
    const surveyPreviewUrl = uri(program.preview_url || '')
      .setSearch({
        ...getSurveyParams(survey),
        testing: 'true',
      })
      .toString();

    return (
      <>
        <Card>
          <Card.Header
            dark
            left={
              <BackButton
                to={routes.toTeamDetails(teamId)}
                label={formIsDirty && 'Cancel'}
              />
            }
          >
            Survey Settings
          </Card.Header>
          <Card.Content to={routes.toTeamSurveyInstructions(teamId)}>
            Survey Instructions
          </Card.Content>
          <Card.Content to={surveyPreviewUrl} disabled={!surveyPreviewUrl}>
            Preview Survey
          </Card.Content>
        </Card>
        {program.survey_config_enabled ? (
          <SurveyFormComponent
            survey={survey}
            loading={isLoading}
            mayEdit={hasCaptainPermission}
            metrics={programMetrics}
            onSubmit={this.handleSubmit}
            teamId={teamId}
            toSurveyInstructions={routes.toTeamSurveyInstructions(teamId)}
          />
        ) : (
          <Card>
            <Card.Header>Measures</Card.Header>
            <Card.Content>
              Your student survey contains the following measures. Click any
              measure to learn more.
            </Card.Content>
            {programMetrics
              .filter(m => survey.metrics.includes(m.uid))
              .map(metric => (
                <Card.Content key={metric.uid}>
                  <Link to={this.getFirstLink(metric)}>{metric.name}</Link>
                </Card.Content>
              ))}
          </Card>
        )}
      </>
    );
  }
}

Survey.defaultProps = {
  program: {},
};

const mapStateToProps = (state, props) => ({
  formIsDirty: isDirty(formName)(state),
  isLoading:
    selectors.loading.metrics(state, props) ||
    selectors.loading.program(state, props) ||
    selectors.loading.surveys(state, props) ||
    selectors.loading.teams(state, props) ||
    isEmpty(selectors.team.survey(state, props)),
  metrics: selectors.metrics.list(state, props),
  program: selectors.program(state, props),
  programMetrics: selectors.program.metrics(state, props),
  survey: selectors.team.survey(state, props),
  surveyFormValues: selectors.form.values(state, { form: 'survey' }),
  hasCaptainPermission: selectors.authUser.hasCaptainPermission(state, props),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...metricsActions,
      ...surveysActions,
      ...teamsActions,
    },
    dispatch,
  ),
});

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Survey);
