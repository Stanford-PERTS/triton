// FlashMessage
//
// Companion component to state/ui flash messages. Pass in the `flashKey` you'd
// like the display and this component will render the component designated (if
// any) in the ui.flash[flashKey] location in state.
//
// Usage:
//   import * as messages from 'state/ui/messages';
//   import FlashMessage from 'components/FlashMessage';
//
//   <div>
//     <FlashMessage flashKey={messages.INVITE_USERS_KEY} />
//   </div>

import React from 'react';
import { connect } from 'react-redux';

import selectors from 'state/selectors';
import * as messages from 'state/ui/messages';

const FlashMessage = ({ flashKey, flashMessageKey }) => {
  const FlashComponent = messages[`${flashMessageKey}_COMPONENT`];
  return FlashComponent ? <FlashComponent /> : null;
};

const mapStateToProps = (state, props) => ({
  flashMessageKey: selectors.flashMessage(state, props),
});

export default connect(mapStateToProps)(FlashMessage);
