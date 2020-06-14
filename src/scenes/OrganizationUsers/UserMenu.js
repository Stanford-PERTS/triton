import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import TermsContext from 'components/TermsContext';
import Dropdown from 'components/Dropdown';

export const UserMenu = props => {
  const terms = useContext(TermsContext);

  const {
    handleRemoveUser,
    handleResendInvitation,
    mayRemoveUser,
    style,
    user,
    isSelf,
  } = props;

  return (
    <Dropdown className="UserMenu" style={style} text="Options">
      <Dropdown.Menu>
        <Dropdown.Header>{user.name}</Dropdown.Header>
        <Dropdown.Item
          className="resend-invitation"
          text="Resend Invitation"
          icon="envelope"
          onClick={() => handleResendInvitation(user)}
          disabled={isSelf}
        />
        <Dropdown.Item
          className="remove-from-organization"
          text={
            isSelf
              ? `Leave ${terms.organization}`
              : `Remove From ${terms.organization}`
          }
          icon="remove"
          onClick={() => handleRemoveUser(user)}
          disabled={!mayRemoveUser}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};

UserMenu.defaulProps = {
  mayRemoveUser: false,
  isSelf: false,
};

UserMenu.propTypes = {
  handleRemoveUser: PropTypes.func.isRequired,
  mayRemoveUser: PropTypes.bool,
  style: PropTypes.object,
  user: PropTypes.object.isRequired,
  isSelf: PropTypes.bool,
};

export default withRouter(UserMenu);
