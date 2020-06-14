import React from 'react';
import PropTypes from 'prop-types';
import 'font-awesome/css/font-awesome.css';

import Card from 'components/Card';
import Icon from 'components/Icon';

import './styles.css';

const SelectableCard = ({ selected, onClick, ...props }) => (
  <Card {...props}>
    <div className="CardSelect" onClick={onClick}>
      {selected && <Icon names="check" />}
    </div>
    {props.children}
  </Card>
);

export default SelectableCard;

SelectableCard.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};

SelectableCard.defaultProps = {
  selected: false,
};
