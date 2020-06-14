import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import styled from 'styled-components';
import theme from 'components/theme';
import { reduxForm } from 'redux-form';
import reduxFormOnSubmit from 'utils/reduxFormOnSubmit';
import reduxFormNameFromProps from 'utils/reduxFormNameFromProps';
import reduxFormInitialValuesFromProps from 'utils/reduxFormInitialValuesFromProps';
import formAction from 'state/form/OrganizationUsers/actions';

import UserMenu from './UserMenu';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import Card from 'components/Card';
import Icon from 'components/Icon';
import Show from 'components/Show';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FlexGrow = styled.div`
  flex-grow: 1;
`;

const MarginDiv = styled.div`
  margin: 0 8px;
  text-align: right;
`;

const Success = styled.span`
  color: ${theme.palette.success};
`;

const User = props => {
  const {
    form,
    handleRequestInvite,
    handleRequestRemove,
    submitting,
    user,
    userIdLoggedIn,
  } = props;

  return (
    <form>
      <Card.Content disabled={submitting}>
        <FlexRow>
          <FlexGrow>
            {user.name || <em>No name set</em>} &ndash; ({user.email})
          </FlexGrow>

          <Show when={submitting}>
            <MarginDiv>
              <Icon names="spinner pulse fw" />
            </MarginDiv>
          </Show>

          <FormSubmitSucceeded form={form}>
            <MarginDiv>
              <Success>
                Sent <Icon names="check" />
              </Success>
            </MarginDiv>
          </FormSubmitSucceeded>

          <UserMenu
            user={user}
            handleResendInvitation={handleRequestInvite}
            handleRemoveUser={handleRequestRemove}
            isSelf={userIdLoggedIn === user.uid}
            mayRemoveUser={true}
            style={{ float: 'right' }}
          />
        </FlexRow>
      </Card.Content>
    </form>
  );
};

User.propTypes = {
  form: PropTypes.string.isRequired,
  handleRequestInvite: PropTypes.func.isRequired,
  handleRequestRemove: PropTypes.func.isRequired,
  isInviting: PropTypes.bool.isRequired,
  isRemoving: PropTypes.bool.isRequired,
  organization: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  userIdLoggedIn: PropTypes.string.isRequired,
};

export default compose(
  reduxFormNameFromProps(({ user }) => `OrganizationUsers:${user.uid}`),
  reduxFormInitialValuesFromProps([
    'isInviting',
    'isRemoving',
    'organization',
    'user',
  ]),
  reduxFormOnSubmit(formAction),
  reduxForm({
    enableReinitialize: true,
  }),
)(User);
