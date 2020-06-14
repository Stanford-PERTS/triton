import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import * as routes from 'routes';
import * as teamsActions from 'state/teams/actions';
import selectors from 'state/selectors';
import { withTermsContext } from 'components/TermsContext';

import isEmpty from 'lodash/isEmpty';
import fromParams from 'utils/fromParams';

import BackButton from 'components/BackButton';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import SectionLoading from 'components/SectionLoading';
import ToggleField from 'components/Form/ToggleField';

class ReportsSettings extends React.Component {
  componentDidMount() {
    const { teamId } = fromParams(this.props);
    const { getTeam } = this.props.actions;
    getTeam(teamId);
  }

  handleToggle = event => {
    const { updateTeam } = this.props.actions;
    const { initialValues: team } = this.props;
    const report_reminders = event.target.checked;

    updateTeam({ ...team, report_reminders });
  };

  render() {
    const { teamId } = fromParams(this.props);
    const { initialValues, terms } = this.props;

    return (
      <div>
        <Section
          title="Report Settings"
          dark
          left={<BackButton to={routes.toTeamDetails(teamId)} />}
        >
          <SectionLoading isLoading={isEmpty(initialValues)}>
            Loading Settings
          </SectionLoading>

          {!isEmpty(initialValues) && (
            <div>
              <SectionItem>
                A new report is generated every Monday if new data were
                collected during the previous Monday&ndash;Friday. Only the{' '}
                {terms.contact.toLowerCase()} for a{' '}
                {terms.classroom.toLowerCase()} can see the report for that{' '}
                {terms.classroom.toLowerCase()}. Data are only shown for groups
                of 5 or more participants.
                <br />
                <br />
                New settings take effect starting with the next report.
              </SectionItem>
              <SectionItem>
                <form className="TeamDetailsForm">
                  <Field
                    label="Send Report Reminders"
                    name="report_reminders"
                    parse={Boolean}
                    component={ToggleField}
                    onChange={this.handleToggle}
                  />
                </form>
              </SectionItem>
            </div>
          )}
        </Section>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  initialValues: selectors.team(state, props),
});

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(teamsActions, dispatch),
  };
}

ReportsSettings.defaultProps = {
  initialValues: null,
};

export default compose(
  withRouter,
  withTermsContext,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  reduxForm({
    form: 'team',
  }),
)(ReportsSettings);
