import React from 'react';
import { connect } from 'react-redux';
import selectors from 'state/selectors';
import * as messages from 'state/ui/messages';

import FlashMessage from 'components/FlashMessage';
import InfoBoxTransition from 'components/InfoBoxTransition';

class CycleFlashMessage extends React.Component {
  render() {
    const { flashCycleRemoveSuccess } = this.props;

    return (
      <InfoBoxTransition success>
        {flashCycleRemoveSuccess && (
          <FlashMessage flashKey={messages.CYCLE_REMOVE_SUCCESS_KEY} />
        )}
      </InfoBoxTransition>
    );
  }
}

const mapStateToProps = (state, props) => ({
  flashCycleRemoveSuccess: selectors.flashMessage(state, {
    flashKey: messages.CYCLE_REMOVE_SUCCESS_KEY,
  }),
});

export default connect(mapStateToProps)(CycleFlashMessage);
