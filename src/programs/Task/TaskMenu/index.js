import React from 'react';
import { withResponseContext } from 'programs/contexts';
import MenuItemIcon from 'components/MenuItemIcon';
import Icon from 'components/Icon';

const TaskMenu = ({ response }) => {
  const complete = response && response.progress === 100;

  return (
    <MenuItemIcon>
      <Icon names="check-circle-o" hidden={!complete} fixedWidth />
    </MenuItemIcon>
  );
};

export default withResponseContext(TaskMenu);
