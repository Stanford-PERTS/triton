// Inline updating of cycle.resolution_date

import React from 'react';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as teamActions from 'state/teams/actions';
import { withAllContexts } from 'programs/contexts';
import { reduxForm, Field } from 'redux-form';

import RadioField from 'components/Form/RadioField';

class TaskInputTitleI extends React.Component {
  updateTitleI = (event, value) => {
    const { team, task } = this.props;
    const { updateTeam } = this.props.actions;
    const { mayEdit } = task;

    if (mayEdit) {
      const updatedTeam = {
        ...team,
        title_one_schools: value,
      };

      updateTeam(updatedTeam);
    }
  };

  render() {
    const { task } = this.props;
    const { mayEdit } = task;

    return (
      <div className="TaskInputTitleI">
        <p>Do any teachers on this team work at a Title I school?</p>
        <Field
          name="title_one_schools"
          options={{
            yes: 'Yes, all of them.',
            no: 'No, none of them.',
            some: 'Some of them.',
            unsure: "I'm not sure.",
          }}
          component={RadioField}
          disabled={!mayEdit}
          onChange={this.updateTitleI}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  initialValues: props.team,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(teamActions, dispatch),
});

export default compose(
  withAllContexts,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  reduxForm({
    form: 'teamTitleI',
    // Needs to be enabled so that the field is updated when navigating between
    // different steps/cycles.
    enableReinitialize: true,
    // If the form is destroyed on unmount, then it doesn't get recreated with
    // the input field receiving the initialValues when navigating between
    // different steps/cycles.
    destroyOnUnmount: false,
  }),
)(TaskInputTitleI);
