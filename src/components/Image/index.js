import React from 'react';
import PropTypes from 'prop-types';

// To add available images to the Image component, import the SVG object here...
import NotificationBell from './NotificationBell.svg';
import Star from './Star.svg';
import TodoListLaptop from './TodoListLaptop.svg';

// ...and then add the image file variable to this `images` object.
const images = {
  NotificationBell,
  Star,
  TodoListLaptop,
};

const Image = ({ image, alt, ...props }) => (
  <img src={images[image]} alt={alt} {...props} />
);

Image.propTypes = {
  // name of image from available `images`
  image: PropTypes.string.isRequired,
  // alt text to apply to image
  alt: PropTypes.string,
  // class to apply to image
  className: PropTypes.string,
};

Image.defaultProps = {
  // alt text '', decorative images that don't add information to the content of
  // the page: https://www.w3.org/WAI/tutorials/images/decorative
  alt: '',
};

export default Image;
