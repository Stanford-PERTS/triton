import styled, { css } from 'styled-components';

const PercentSurveyedChartContainer = styled.div`
  display: inline-block;

  ${props =>
    props.inline
      ? css`
          /* For displaying inline in ClassroomList */
          margin-right: 10px;
          height: ${props.height - 4}px;
          width: ${props.width - 4}px;
        `
      : css`
          /* For displaying in ClassroomDetails */
          height: ${props.height}px;
          width: ${props.width}px;
        `};
`;

export default PercentSurveyedChartContainer;
