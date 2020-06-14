/**
 * ChartJS Donut Chart with nice defaults
 * - Single category values displayed in the center
 * - No tooltips
 * - No legend
 * - Colors
 * - React lifecycle integration
 */
import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import isEqual from 'lodash/isEqual';
import chartCenterLabelPlugin from 'utils/chartCenterLabelPlugin';

class DonutChart extends React.Component {
  // Once the DOM is available, have ChartJS render the pie chart.
  componentDidMount() {
    // Otherwise it will attempt to resize via media queries and will become
    // an uncontrollable monster.
    Chart.defaults.global.responsive = false;

    Chart.pluginService.register(chartCenterLabelPlugin);

    // this.canvas set by a ref callback in render()
    // https://reactjs.org/docs/refs-and-the-dom.html#adding-a-ref-to-a-dom-element
    this.chart = new Chart(this.canvas.getContext('2d'), this.getChartConfig());
  }

  // In case someone changes the number of students in the class.
  componentDidUpdate() {
    this.chart.config = this.getChartConfig();
    this.chart.update();
  }

  // Important to return false on most state changes because we don't want to
  // reanimate all the pie slices every time.
  shouldComponentUpdate(nextProps) {
    return (
      this.props.title !== nextProps.title ||
      !isEqual(this.props.labels, nextProps.labels) ||
      !isEqual(this.props.data, nextProps.data)
    );
  }

  getChartConfig() {
    const {
      cutoutPercentage,
      showLabel,
      alwaysShowIndex,
      title,
      labels,
      data,
    } = this.props;

    const colors = this.getColors(data.length);

    const config = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            borderWidth: Array(data.length).fill(2),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: title,
        },
        legend: { display: false },
        cutoutPercentage,
        tooltips: {
          enabled: false,
        },
      },
    };

    if (showLabel) {
      let showDatum, showIndex;
      if (alwaysShowIndex === undefined) {
        // Put the value corresponding the largest category in the center.
        showDatum = Math.max(...data);
        showIndex = data.indexOf(showDatum);
      } else {
        // Otherwise put the specified value in the center.
        showDatum = data[alwaysShowIndex];
        showIndex = alwaysShowIndex;
      }
      config.options.elements = {
        center: {
          text: `${showDatum}%`,
          color: showDatum === 0 ? '#DDDDDD' : colors[showIndex],
          fontStyle: 'Open Sans',
          sidePadding: 25,
        },
      };
    }

    return config;
  }

  /**
   * Get colors for any number of pie wedges.
   * @param {number} num integer greater than zero.
   * @returns {Array} of #-prefixed hex color strings.
   * {@link http://www.mulinblog.com/a-color-palette-optimized-for-data-visualization/}
   */
  getColors(num) {
    let colors = [
      '#60BD68', // green
      '#DDDDDD', // light gray
      '#F15854', // red
      '#5DA5DA', // blue
      '#FAA43A', // orange
      '#F17CB0', // pink
      '#B2912F', // brown
      '#B276B2', // purple
      '#DECF3F', // yellow
      '#4D4D4D', // gray
    ];
    const defaultColor = '#ccc';
    if (num > colors.length) {
      colors = colors.concat(Array(num - colors.length).fill(defaultColor));
    }
    return colors.slice(0, num);
  }

  render() {
    const { width, height } = this.props;
    return (
      <canvas
        ref={elem => (this.canvas = elem)}
        width={width}
        height={height}
      />
    );
  }
}

DonutChart.propTypes = {
  cutoutPercentage: PropTypes.number,
  showLabel: PropTypes.bool,
  // When this is not set, the chart's center label will display the largest
  // valuable available, matching the color of that category. If set, it always
  // displays, e.g., the zeroth value.
  alwaysShowIndex: PropTypes.number,
  title: PropTypes.string,
  labels: PropTypes.array,
  data: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
  height: PropTypes.number,
};

DonutChart.defaultProps = {
  cutoutPercentage: 50,
  showLabel: true,
  alwaysShowIndex: undefined,
  title: '',
  labels: [],
  width: 500,
  height: 200,
};

export default DonutChart;
