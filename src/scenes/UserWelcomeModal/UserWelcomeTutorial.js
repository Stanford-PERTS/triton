import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { compose } from 'recompose';
import { reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';

import * as routes from 'routes';

import FakeLink from 'components/FakeLink';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

import validate from './validate';

export const shouldDisplay = (program, user) =>
  user.owned_teams.length === 0 && user.owned_organizations.length === 0;

const SmallerSectionItem = styled(SectionItem)`
  padding: 10px;

  i {
    font-size: 32px !important;
  }
`;

const UserWelcomeTutorial = props => {
  const { dismiss, handleSubmit, history, program } = props;
  const terms = useContext(TermsContext);
  const teamTerm = terms.team.toLowerCase();

  return (
    <form className="UserWelcomeTutorial" onSubmit={handleSubmit}>
      <div className="UserWelcomeTitle">Welcome to Copilot!</div>

      <SmallerSectionItem>
        Every {terms.member.toLowerCase()} in Copilot works on a{' '}
        <em>{teamTerm}</em> to reflect on student feedback and improve their
        professional practice. Let&rsquo;s set up a {teamTerm} for you.
      </SmallerSectionItem>
      <SmallerSectionItem
        icon="users"
        onClick={() => {
          dismiss();
          history.push(routes.toNewTeam(program.label));
        }}
      >
        <FakeLink>Start a new {teamTerm}</FakeLink>. You can go solo or invite
        colleagues to join your team later.
      </SmallerSectionItem>
      <SmallerSectionItem>
        <strong>OR</strong>
      </SmallerSectionItem>
      <SmallerSectionItem icon="envelope">
        If your colleagues already have a {teamTerm}, ask them to send you an
        invitation email. We&rsquo;ll see you then!
      </SmallerSectionItem>

      {/* for spacing */}
      <SmallerSectionItem> </SmallerSectionItem>

      <SmallerSectionItem onClick={dismiss}>
        <FakeLink data-test="dismiss">Dismiss</FakeLink> if you&rsquo;re sure
        you don&rsquo;t want to set up a {teamTerm} right now.
      </SmallerSectionItem>
    </form>
  );
};

UserWelcomeTutorial.propTypes = {
  dismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  reduxForm({
    form: 'welcome',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    validate,
  }),
)(UserWelcomeTutorial);
