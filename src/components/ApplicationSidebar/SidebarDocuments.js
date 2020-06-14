import React from 'react';
import * as routes from 'routes';

import Icon from 'components/Icon';
import MenuItem from 'components/MenuItem';
import MenuLink from 'components/MenuLink';
import MenuItemIcon from 'components/MenuItemIcon';
import MenuItemText from 'components/MenuItemText';

import { ProgramDocumentsIndex } from 'programs';

const SidebarDocuments = ({ program, teamId }) => {
  if (!program) {
    return null;
  }

  // Programs may export these as null, in which case we don't
  // display a documents link.
  const ProgramDocumentsContent = ProgramDocumentsIndex[program.label];
  if (!ProgramDocumentsContent) {
    return null;
  }

  return (
    <MenuItem>
      <MenuLink to={routes.toTeamDocuments(teamId)} activeClassName="active">
        <MenuItemIcon>
          <Icon names="file-text-o" />
        </MenuItemIcon>
        <MenuItemText>Documents</MenuItemText>
      </MenuLink>
    </MenuItem>
  );
};

export default SidebarDocuments;
