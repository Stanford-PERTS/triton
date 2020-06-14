import React from 'react';
import styled from 'styled-components';

import Dropdown from 'components/Dropdown';
import Icon from 'components/Icon';
import Link from 'components/Link';
import theme from 'components/theme';

export interface MenuConfigItem {
  text: string;
  icon: string;
  to: string;
}

const CardMenu = ({ menuConfig }: { menuConfig: MenuConfigItem[] }) => (
  <Dropdown>
    <Dropdown.Menu>
      {menuConfig.map((config: MenuConfigItem, i) => (
        <ItemLinkStyled key={i}>
          <Link to={config.to}>
            <Dropdown.Item>
              <Icon names={config.icon} />
              {config.text}
            </Dropdown.Item>
          </Link>
        </ItemLinkStyled>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);

const ItemLinkStyled = styled.div`
  a {
    color: ${theme.palette.black};

    :focus,
    :hover {
      text-decoration: none;
    }
  }

  i {
    margin-right: 5px;
  }
`;

export default CardMenu;
