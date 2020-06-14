// InfoBoxList
//
// Usage:
//   <InfoBox>
//     <div> <!-- div keeps things aligned in a single column -->
//       Text to appear within the InfoBox.
//       <InfoBoxList list={[1, 2, 3]} />
//     </div>
//   </InfoBox>

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InfoBoxListStyled = styled.div`
  ul {
    list-style-type: none;
    padding-top: 15px;
    padding-left: 15px;
    text-align: left;
  }
`;

const InfoBoxList = ({ list, ...rest }) => (
  <InfoBoxListStyled className="InfoBoxList" {...rest}>
    <ul>
      {list.map(item => (
        <li key={String(item)}>{item}</li>
      ))}
    </ul>
  </InfoBoxListStyled>
);

export default InfoBoxList;

InfoBoxList.propTypes = {
  list: PropTypes.array,
};
