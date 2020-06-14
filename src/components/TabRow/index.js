import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import './styles.css';

const TabRow = props => (
  <div className="tab-wrapper">
    {props.tabs.map(t => (
      <Link
        to={t.href}
        key={t.id}
        className={classNames('tab', { active: props.activeId === t.id })}
      >
        {t.text}
      </Link>
    ))}
  </div>
);

TabRow.propTypes = {
  // Array of tab objects, each with props `id`, `text`, and `href`
  tabs: PropTypes.array.isRequired,
  // id of the active tab
  activeId: PropTypes.string,
};

export default TabRow;
