import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { submit } from 'redux-form';

import TermsContext from 'components/TermsContext';
import User from './User';
import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import Modal from 'components/Modal';
import Section from 'components/Section';

import * as routes from 'routes';

const OrganizationUsersRender = props => {
  const [invitingUser, setInvitingUser] = useState(false);
  const [removingUser, setRemovingUser] = useState(false);
  const terms = useContext(TermsContext);

  const { organization, users, userIdLoggedIn } = props;

  // Handler for inviting user
  const handleConfirmInvite = () => {
    const { submitForm } = props.actions;
    submitForm(`OrganizationUsers:${invitingUser.uid}`);
    setInvitingUser(false);
  };

  // Handler for removing user
  const handleConfirmRemove = () => {
    const { submitForm } = props.actions;
    submitForm(`OrganizationUsers:${removingUser.uid}`);
    setRemovingUser(false);
  };

  const showAreYouSureLeave =
    removingUser && users.length > 1 && userIdLoggedIn === removingUser.uid;
  const showAreYouSureRemove =
    removingUser && users.length > 1 && userIdLoggedIn !== removingUser.uid;

  return (
    <Section
      dark
      title={`${terms.organization} Administrators`}
      to={routes.toOrganizationUsersInvite(organization.uid)}
    >
      {users.map(user => (
        <User
          key={user.uid}
          organization={organization}
          user={user}
          userIdLoggedIn={userIdLoggedIn}
          handleRequestInvite={setInvitingUser}
          handleRequestRemove={setRemovingUser}
          isInviting={invitingUser && invitingUser.uid === user.uid}
          isRemoving={removingUser && removingUser.uid === user.uid}
        />
      ))}

      {invitingUser && (
        <Modal title="Are You Sure?">
          <p>
            Are you sure you want to resend an invitation to{' '}
            <em>{invitingUser.email}</em>?
          </p>
          <ButtonContainer horizontal>
            <Button cancel onClick={() => setInvitingUser(false)}>
              Cancel
            </Button>
            <Button caution onClick={handleConfirmInvite}>
              Yes, Send
            </Button>
          </ButtonContainer>
        </Modal>
      )}

      {showAreYouSureLeave && (
        <Modal title="Are You Sure?">
          <p>
            Are you sure you want to leave <em>{organization.name}</em>?
          </p>
          <ButtonContainer horizontal>
            <Button cancel onClick={() => setRemovingUser(false)}>
              Stay
            </Button>
            <Button caution onClick={handleConfirmRemove}>
              Leave
            </Button>
          </ButtonContainer>
        </Modal>
      )}

      {showAreYouSureRemove && (
        <Modal title="Are You Sure?">
          <p>
            Are you sure you want to remove {removingUser.name} from{' '}
            <em>{organization.name}</em>?
          </p>
          <ButtonContainer horizontal>
            <Button cancel onClick={() => setRemovingUser(false)}>
              Cancel
            </Button>
            <Button caution onClick={handleConfirmRemove}>
              Remove
            </Button>
          </ButtonContainer>
        </Modal>
      )}

      {removingUser && users.length === 1 && (
        <Modal title={`Unable to Leave ${terms.organization}`}>
          <p>
            The last member of {terms.a.organization.toLowerCase()} is not
            allowed to leave. Please delete the{' '}
            {terms.organization.toLowerCase()} instead.
          </p>
          <ButtonContainer horizontal>
            <Button cancel onClick={() => setRemovingUser(false)}>
              Close
            </Button>

            <Link to={routes.toOrganizationDetails(organization.uid)}>
              <Button cancel>{terms.organization} Details</Button>
            </Link>
          </ButtonContainer>
        </Modal>
      )}
    </Section>
  );
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ submitForm: submit }, dispatch),
});

export default connect(
  null,
  mapDispatchToProps,
)(OrganizationUsersRender);
