import React from 'react';
import PropTypes from 'prop-types';
import _values from 'lodash/values';

import Loading from 'components/Loading';

import UserWelcomeFormName, {
  shouldDisplay as shouldDisplayName,
} from './UserWelcomeFormName';
import UserWelcomeFormConsent, {
  shouldDisplay as shouldDisplayConsent,
} from './UserWelcomeFormConsent';
import UserWelcomeTutorial, {
  shouldDisplay as shouldDisplayTutorial,
} from './UserWelcomeTutorial';

const pageDisplayRules = {
  '1': shouldDisplayName,
  '2': shouldDisplayConsent,
  '3': shouldDisplayTutorial,
};

export const shouldDisplay = (program, user) =>
  _values(pageDisplayRules).some(f => f(program, user));

class UserWelcomeForm extends React.Component {
  state = {
    page: null,
  };

  componentDidMount() {
    const { program, user } = this.props;
    if (shouldDisplayName(program, user)) {
      this.setState({ page: 1 });
    } else if (shouldDisplayConsent(program, user)) {
      this.setState({ page: 2 });
    } else if (shouldDisplayTutorial(program, user)) {
      this.setState({ page: 3 });
    } // else the parent component should have skipped rendering us entirely
  }

  nextPage = (...args) => {
    const { dismiss, program, onSubmit, user } = this.props;
    // Save data as each page is completed, in case the user leaves mid-process.
    onSubmit(...args);

    // Find the next displayable page, making sure not to render any pages
    // that shouldn't display.

    const pageNumbers = Object.keys(pageDisplayRules).map(Number);
    const lastPage = pageNumbers.reduce((last, p) => (p > last ? p : last));
    const { page } = this.state;

    // Starting with the next page, going until the last page, check if their
    // display rule applies.
    for (let p = page + 1; p <= lastPage; p += 1) {
      if (!(p in pageDisplayRules)) {
        console.error(`Page ${p} not found in pageDisplayRules.`);
        this.setState({ page: null });
        return;
      }
      const display = pageDisplayRules[p];
      if (display(program, user)) {
        // Found a page that needs display. Trigger a render.
        this.setState({ page: p });
        return;
      }
    }

    // No remaining pages to display.
    dismiss();
  };

  render() {
    const { page } = this.state;
    const { dismiss, onSubmit, program, user } = this.props;

    if (!user) {
      return <Loading />;
    }

    return (
      <div className="UserWelcomeForm">
        {page === 1 && (
          <UserWelcomeFormName
            initialValues={{ name: user.name }}
            onSubmit={this.nextPage}
          />
        )}
        {page === 2 && (
          <UserWelcomeFormConsent onSubmit={this.nextPage} program={program} />
        )}
        {page === 3 && (
          <UserWelcomeTutorial
            onSubmit={onSubmit}
            dismiss={dismiss}
            program={program}
          />
        )}
      </div>
    );
  }
}

UserWelcomeForm.propTypes = {
  dismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  program: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

export default UserWelcomeForm;
