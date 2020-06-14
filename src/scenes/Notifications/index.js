import React from 'react';
import { compose } from 'recompose';
import moment from 'moment/moment';
import parser from 'html-react-parser';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as digestsActions from 'state/digests/actions';
import selectors from 'state/selectors';
import fromParams from 'utils/fromParams';

import SceneTitle from 'components/SceneTitle';
import Section from 'components/Section';
import SectionButton from 'components/SectionButton';
import SectionItem from 'components/SectionItem';

import './styles.css';

class Notifications extends React.Component {
  componentDidMount() {
    const { actions } = this.props;
    const { userId } = fromParams(this.props);
    actions.getUnreadUserDigests(userId);
  }

  getLocalDate(dateStr) {
    return moment(dateStr)
      .toDate()
      .toLocaleDateString();
  }

  getDigestTitle(digest) {
    const created = this.getLocalDate(digest.created);
    const read = digest.read ? ' (read)' : '';
    return `${created} — ${digest.subject}${read}`;
  }

  handleViewAllClick = () => {
    const { actions } = this.props;
    const { userId } = fromParams(this.props);
    actions.getAllUserDigests(userId);
  };

  render() {
    const { digests } = this.props;
    const { userId } = fromParams(this.props);

    if (!userId) {
      return <div />;
    }

    const ViewAllButton = () => (
      <SectionButton onClick={this.handleViewAllClick} dark>
        View All
      </SectionButton>
    );

    return (
      <div className="Notifications">
        <SceneTitle title="Your Notifications" right={<ViewAllButton />} />
        {digests.length === 0 ? (
          <div className="no-unread">You have no unread notifications.</div>
        ) : (
          digests.map(d => (
            <Section
              title={this.getDigestTitle(d)}
              key={d.uid}
              className={d.read ? 'read' : 'unread'}
            >
              <SectionItem>{parser(d.body)}</SectionItem>
            </Section>
          ))
        )}
      </div>
    );
  }
}

Notifications.defaultProps = {
  digests: [],
};

function mapStateToProps(state, props) {
  return {
    digests: selectors.digests.list(state, props),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(digestsActions, dispatch),
  };
}

export default compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Notifications);
