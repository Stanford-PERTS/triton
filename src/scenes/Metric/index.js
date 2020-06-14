// Metric Details Scene
//
// Built for the Copilot prototype, later dropped in favor of linking metrics
// directly to perts.net. Retained in case the spec changes again.

import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import isEmpty from 'lodash/isEmpty';

import BackButton from 'components/BackButton';
import SceneTitle from 'components/SceneTitle';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

import selectors from 'state/selectors';
import * as metricsActions from 'state/metrics/actions';

export class Metric extends React.Component {
  componentDidMount() {
    const { metricId } = this.props.match.params;
    const { getMetric } = this.props;
    getMetric(metricId);
  }

  render() {
    const { location, metrics } = this.props;
    const { metricId } = this.props.match.params;
    const metric = metrics[metricId] || {};

    if (isEmpty(metric)) {
      return null;
    }
    const readings = metric.links.filter(({ type }) => type === 'reading');
    const researchers = metric.links.filter(
      ({ type }) => type === 'researcher',
    );

    return (
      <>
        <SceneTitle
          title="Metrics"
          left={<BackButton to={location.pathname} />}
        />
        <Section title="Short Description">
          <SectionItem>{metric.description}</SectionItem>
        </Section>
        <Section title="Additional Reading">
          {readings.map(reading => (
            <SectionItem key={reading.url} to={reading.url}>
              {reading.text}
            </SectionItem>
          ))}
        </Section>
        <Section title="Affiliated Researchers">
          {researchers.map(r => (
            <SectionItem key={r.url} to={r.url}>
              {r.text}
            </SectionItem>
          ))}
        </Section>
      </>
    );
  }
}

// Typechecking and default values make testing so much easier, we should
// definitly do this with all our components.
Metric.propTypes = {
  // router props
  location: PropTypes.object,
  match: PropTypes.object,
  // actions
  dispatch: PropTypes.func,
  getMetric: PropTypes.func,
  // state
  metrics: PropTypes.objectOf(PropTypes.object),
};

Metric.defaultProps = {
  // router props
  location: {},
  match: { params: {} },
  // actions
  dispatch: noop,
  getMetric: noop,
  // state
  metrics: {},
};

const mapStateToProps = (state, props) => ({
  metrics: selectors.metrics(state, props),
});

// Unpacking of action creators, makes for cleaner defaultProps
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({ ...metricsActions }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Metric);
