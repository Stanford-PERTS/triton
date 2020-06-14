import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled, { css } from 'styled-components/macro';

import noop from 'lodash/noop';

const ModalBackground = styled.div`
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  overflow: scroll;

  background: RGBA(31, 38, 55, 0.95);
`;

const ModalContainer = styled.div`
  border-radius: 5px;
  background: white;
  padding: 0;

  position: relative;

  width: 400px;
  ${props =>
    props.width &&
    css`
      width: ${props.width};
    `};
  margin: auto;

  overflow: none;
`;

const ModalTitle = styled.h1`
  /* match styles to SectionHeaders */
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background: #4a4a4a;
  color: #ffffff;
  padding: 10px;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 0;

  /* match height to SectionHeaders */
  height: 40px;

  /* center align horizontall and vertically */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ModalContent = styled.section`
  margin: 20px;
  padding: 10px;
  text-align: center;

  img {
    width: 100px;
    display: block;
    margin: 15px auto;
  }

  .UserWelcomeTitle {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 20px;
    margin-bottom: 20px;
  }

  .UserWelcomeContent {
    font-size: 16px;
  }

  .UserWelcomeForm {
    margin: 20px 0;
  }
`;

const Modal = props => {
  const { className, onBackgroundClick = noop, width } = props;
  const classes = classnames('Modal', className);

  return (
    <div className={classes}>
      <ModalBackground onClick={onBackgroundClick}>
        {/* Don't fire the background onClick when clicking the modal. */}
        <ModalContainer onClick={e => e.stopPropagation()} width={width}>
          {props.title && <ModalTitle>{props.title}</ModalTitle>}
          <ModalContent>{props.children}</ModalContent>
        </ModalContainer>
      </ModalBackground>
    </div>
  );
};

export default Modal;

Modal.propTypes = {
  children: PropTypes.node.isRequired,
};
