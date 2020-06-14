import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import selectors from 'state/selectors';
// import fromParams from 'utils/fromParams';
// import { TRITON_URL_PREFIX } from 'services/triton/config';
// import getJwtToken from 'services/triton/helpers/getJwtToken';

import Card from 'components/Card';

const TaskCompletionCertificate = props => (
  // const { userId } = props;
  // const { teamId } = fromParams(props);
  // const token = getJwtToken();

  /* eslint-disable max-len */
  // const url = `${TRITON_URL_PREFIX}/completion/${userId}/${teamId}?token=${token}`;
  /* eslint-enable max-len */

  <>
    <Card.Content>
      Starting November 30 2019, you will be able to download a completion
      certificate here. Ask your Team Captain or Sponsor whether you can use it
      to earn continuing education units in your district.
    </Card.Content>
    {/* Release on 10/30/2019
      <Card.Content to={url} externalLink>
        Click here to see completion certificate
      </Card.Content>
      */}
  </>
);

const mapStateToProps = (state, props) => ({
  userId: selectors.auth.user.uid(state, props),
});

export default compose(
  withRouter,
  connect(mapStateToProps),
)(TaskCompletionCertificate);
