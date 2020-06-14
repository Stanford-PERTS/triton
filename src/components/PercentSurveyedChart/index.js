import React from 'react';
import { defaults, Chart, Doughnut } from 'react-chartjs-2';

import PercentSurveyedChartContainer from './PercentSurveyedChartContainer';
import chartCenterLabelPlugin from 'utils/chartCenterLabelPlugin';

import theme from 'components/theme';

// ChartJS Doughnut
// http://www.chartjs.org/docs/latest/charts/doughnut.html

defaults.global.responsive = false;
defaults.global.legend.display = false;
defaults.global.tooltips.enabled = false;
Chart.pluginService.register(chartCenterLabelPlugin);

const PercentSurveyedChart = ({ percentSurveyed, title }) => {
  const data = {
    datasets: [
      {
        data: [percentSurveyed, 100 - percentSurveyed],
        backgroundColor: [theme.green, theme.gray],
        hoverBackgroundColor: [theme.green, theme.gray],
        borderWidth: [0, 0],
      },
    ],
  };

  // Existence of `title` indicates we are displaying on ClassroomDetails,
  // else assume we are displaying inline in ClassroomList.
  const options = title
    ? {
        title: {
          display: true,
          text: title,
        },
        elements: {
          center: {
            text: `${percentSurveyed}%`,
            color: theme.green,
            fontStyle: 'Open Sans',
            sidePadding: 25,
          },
        },
        height: 200,
        width: 300,
        animation: { animateRotate: true },
        // Otherwise it will attempt to resize via media queries and will become
        // an uncontrollable monster.
        maintainAspectRatio: false,
        cutoutPercentage: 50,
      }
    : {
        height: 22,
        width: 22,
        animation: { animateRotate: false },
        maintainAspectRatio: false,
        cutoutPercentage: 0,
      };

  return (
    <PercentSurveyedChartContainer
      inline={!title}
      height={options.height}
      width={options.width}
    >
      <Doughnut
        data={data}
        options={options}
        height={options.height}
        width={options.width}
      />
    </PercentSurveyedChartContainer>
  );
};

PercentSurveyedChart.defaultProps = {
  title: null,
};

export default PercentSurveyedChart;
