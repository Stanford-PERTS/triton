import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Dropdown from 'components/Dropdown';

export const OrganizationMenu = props => {
  const {
    organization,
    mayRemoveOrganization,
    handleRemoveOrganization,
    style,
  } = props;

  return (
    <Dropdown className="OrganizationMenu" style={style} text="Options">
      <Dropdown.Menu>
        <Dropdown.Header>{organization.name}</Dropdown.Header>
        <Dropdown.Item
          className="remove-from-team"
          disabled={!mayRemoveOrganization}
          text="Remove"
          icon="remove"
          onClick={() => handleRemoveOrganization(organization)}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};

OrganizationMenu.propTypes = {
  organization: PropTypes.object.isRequired,
  mayRemoveOrganization: PropTypes.bool.isRequired,
  handleRemoveOrganization: PropTypes.func.isRequired,
};

export default withRouter(OrganizationMenu);
