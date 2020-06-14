import React from 'react';
import styled, { css } from 'styled-components';

/**
 * Additional row of labels for radio buttons, above real labels. Helps with
 * big horizontal likerts that look like this:
 *
 * Not at all likely             Very Likely
 * 1    2    3    4    5    6    7    8    9
 * o    o    o    o    o    o    o    o    o
 *
 * @example
 *   <RadioAxis>
 *     <RadioAxisLabel start>Not at all likely</RadioAxisLabel>
 *     <RadioAxisLabel end>Extremely likely</RadioAxisLabel>
 *   </RadioAxis>
 *   <Field { radio field here } />
 * @type {StyledComponent}
 */
export const RadioAxis = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;
`;

// Don't pass non-standard attributes directly to an html element, or else
// warnings, e.g. "Received `true` for a non-boolean attribute..."
export const RadioAxisLabel = styled(({ start, end, ...props }) => (
  <div {...props} />
))`
  ${props =>
    props.start &&
    css`
      align-items: flex-start;
    `};
  ${props =>
    props.end &&
    css`
      align-items: flex-end;
    `};
`;
