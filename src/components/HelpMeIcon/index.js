import React from 'react';

import { Icon, Tooltip } from 'antd';

const HelpMeIcon = ({ children }) => (
  <Tooltip title={children}>
    <Icon className="helpme" type="question-circle-o" />
  </Tooltip>
);

export default HelpMeIcon;
