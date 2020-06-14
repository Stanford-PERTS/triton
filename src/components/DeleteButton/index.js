import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from 'components/Button';

const DeleteButtonContainer = styled.div`
  text-align: center;

  p {
    margin-bottom: 10px;
  }

  ${Button} {
    margin-bottom: 10px;
  }

  ${Button}:last-child {
    margin-bottom: 0;
  }
`;

const DeleteButton = props => {
  // Track whether the button is in the confirmation state.
  const [confirmation, setConfirmation] = useState(false);

  const {
    children,
    confirmationText,
    disabled,
    disabledText,
    initialText,
    loading,
    loadingText,
    onClick,
  } = props;

  return (
    <DeleteButtonContainer>
      {confirmation ? (
        <>
          <p>{initialText}</p>
          <Button cancel onClick={() => setConfirmation(false)}>
            No, I&rsquo;ve changed my mind.
          </Button>
          <Button
            caution
            onClick={onClick}
            loading={loading}
            loadingText={loadingText}
          >
            Yes, I&rsquo;m sure.
          </Button>
        </>
      ) : (
        <>
          <p>{disabled ? disabledText : confirmationText}</p>
          <Button
            danger
            disabled={disabled}
            onClick={() => setConfirmation(true)}
          >
            {children}
          </Button>
        </>
      )}
    </DeleteButtonContainer>
  );
};

export default DeleteButton;

DeleteButton.propTypes = {
  // The button text.
  children: PropTypes.node,

  // Text to display initially (e.g., "Click below to delete.").
  // Note: Yes, the prop is incorrectly named, swapped with `initialText`,
  // but we haven't fixed all the components using this backwards interface.
  confirmationText: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
    .isRequired,

  // Sets the button's disabled state.
  disabled: PropTypes.bool,

  // Text to display when button is disabled.
  disabledText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  // Text to display when asking user to confirm action (e.g., "Are you sure?")
  // Note: Yes, the prop is incorrectly named, swapped with `confirmationText`,
  // but we haven't fixed all the components using this backwards interface.
  initialText: PropTypes.node.isRequired,

  // Sets the button's loading state.
  loading: PropTypes.bool,

  // Button text to display when the button is in loading state.
  loadingText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  // Callback function
  onClick: PropTypes.func.isRequired,
};
