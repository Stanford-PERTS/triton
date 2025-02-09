/**
 * A ChartJS plugin to insert a data label in the center of a doughnut chart.
 *
 * Example:
 *
 * Chart.pluginService.register(chartCenterLabelPlugin);
 *
 * Then include in the chart config:
 *
 * { options: { elements: { center: {
 *   text,
 *   color,
 *   fontStyle,
 *   sidePadding,
 *  }}}}
 *
 * {@link https://stackoverflow.com/questions/20966817/how-to-add-text-inside-the-doughnut-chart-using-chart-js#answer-43026361}
 */
export default {
  beforeDraw(chart) {
    if (!chart.config.options.elements.center) {
      return;
    }
    // Get ctx from string
    const { ctx } = chart.chart;
    const {
      fontStyle = 'Arial',
      text,
      color = '#000',
      sidePadding = 20,
    } = chart.config.options.elements.center;
    const sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);

    // Start with a base font of 30px
    ctx.font = `30px ${fontStyle}`;

    // Get the width of the string and also the width of the element minus 10
    // to give it 5px side padding
    const stringWidth = ctx.measureText(text).width;
    const elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

    // Find out how much the font can grow in width.
    const widthRatio = elementWidth / stringWidth;
    const newFontSize = Math.floor(30 * widthRatio);
    const elementHeight = chart.innerRadius * 2;

    // Pick a new font size so it will not be larger than the height of label.
    const fontSizeToUse = Math.min(newFontSize, elementHeight);

    // Set font settings to draw it correctly.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
    ctx.font = `${fontSizeToUse}px ${fontStyle}`;
    ctx.fillStyle = color;

    // Draw text in center
    ctx.fillText(text, centerX, centerY);
  },
};
