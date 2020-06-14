import React from 'react';
import { NavLink } from 'react-router-dom';

const TabsItem = ({ to, children }) => (
  <NavLink to={to} activeClassName="active">
    {children}
  </NavLink>
);

export default TabsItem;
