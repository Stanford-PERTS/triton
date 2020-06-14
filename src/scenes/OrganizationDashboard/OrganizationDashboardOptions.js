import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import { reduxForm, Field } from 'redux-form';

import Card from 'components/Card';
import SelectField from 'components/Form/SelectField';
import TextField from 'components/Form/TextField';

class OrganizationDashboardOptions extends React.Component {
  onChangeFilter = event => {
    // Populate the search field with the selected option.
    const { value } = event.target;
    const { change } = this.props;
    change('search', value);
  };

  onChangeSearch = () => {
    // Reset the select when user interacts with the search field.
    const { change } = this.props;
    change('filter', 'all');
  };

  render() {
    const { dashboardOptions } = this.props;

    return (
      <Card.Content>
        <Field
          name="filter"
          label="Filter"
          component={SelectField}
          options={dashboardOptions}
          onChange={this.onChangeFilter}
        />
        <Field
          type="text"
          name="search"
          label="Search"
          component={TextField}
          onChange={this.onChangeSearch}
        />
      </Card.Content>
    );
  }
}

const mapStateToProps = (state, props) => ({
  dashboardOptions: selectors.dashboard.options(state, {
    form: 'organizationDashboard',
  }),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: 'organizationDashboard',
    // Teams paging starts at page 1.
    initialValues: { page: 1 },
  }),
)(OrganizationDashboardOptions);
