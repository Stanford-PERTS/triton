import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import InfoBoxImage from 'components/InfoBoxImage';
import InfoBoxText from 'components/InfoBoxText';
import InfoBoxArrow from 'components/InfoBoxArrow';
import Image from 'components/Image';
import arrow from './arrow.png';

const GetStartedInfoBox = styled(InfoBox)`
  padding: 20px 40px;
  text-align: left;
`;

const GetStartedImage = styled(Image)`
  width: 100px;
`;

const GetStarted = ({ children, noarrow, image, ...props }) => (
  <GetStartedInfoBox dark {...props}>
    <InfoBoxImage>
      {!image && <GetStartedImage image="NotificationBell" />}
      {image && <GetStartedImage image={image} />}
    </InfoBoxImage>
    <InfoBoxText>{children}</InfoBoxText>
    <InfoBoxArrow>{!noarrow && <img src={arrow} alt="" />}</InfoBoxArrow>
  </GetStartedInfoBox>
);

GetStarted.propTypes = {
  // Message to user (eg, "You haven't added any Teams yet.")
  children: PropTypes.node.isRequired,
  // Optional, set `noarrow` if you'd like to hide the pointer arrow
  noarrow: PropTypes.bool,
  // Optional, if you want to specify an Image (see component) instead of using
  // the default NotificationBell.
  image: PropTypes.string,
};

export default GetStarted;
