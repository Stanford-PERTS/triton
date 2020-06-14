import React from 'react';

import TabsContainer from './TabsContainer';
import TabsItem from './TabsItem';
import TabsStyled from './TabsStyled';

const Tabs = props => {
  const { tabs } = props;
  return (
    <TabsContainer>
      <TabsStyled>
        {tabs.map((t, i) => (
          <TabsItem key={i} to={t.route}>
            {t.label}
          </TabsItem>
        ))}
      </TabsStyled>
    </TabsContainer>
  );
};

export default Tabs;
