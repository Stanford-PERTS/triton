import styled, { css } from 'styled-components';

/**
 * Keep the child node as a specific aspect ratio. Defaults to 16:9 for video.
 * @example
 *   <AspectRatio ratio={4/3}>
 *     <iframe ... />
 *   </AspectRatio>
 *
 * @param {Object} props        props
 * @param {number} props.ratio  float representing width to height ratio
 * @returns {StyledComponent}   styled wrapper
 */
const AspectRatio = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56%; // 9:16

  // It's common to think of aspect ratios as width/height, but we need
  // to convert to a percentage-height to use in padding bottom. Take the
  // inverse and convert to a percent.
  ${props => css`
    padding-bottom: ${Math.round(Math.pow(props.ratio, -1) * 100)}%;
  `};

  > * {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
`;

export default AspectRatio;
