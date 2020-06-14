import styled, { css } from 'styled-components';

import theme from 'components/theme';

/**
 * Flex row with convenient break points for TaskModule content.
 * @param   {Object}  props                 props
 * @param   {boolean} props.centerVertical  centers content vertically
 * @param   {string}  props.justifyContent  applies CSS rule
 * @returns {StyledComponent} to render
 */
const Multicolumn = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0 20px 0;
  margin-left: -5px;
  margin-right: -5px;

  ${props =>
    props.centerVertical &&
    css`
      align-items: center;
    `};

  ${props =>
    props.justifyContent &&
    css`
      justify-content: ${props.justifyContent};
    `};

  > * {
    margin-left: 5px;
    margin-right: 5px;
  }

  @media ${theme.units.multiColumnMaxWidthCollapsed} {
    flex-direction: column;
    align-items: center;
    padding-top: 5px;
    padding-bottom: 5px;

    > * {
      padding-top: 5px;
      padding-bottom: 5px;
    }
  }

  @media ${theme.units.desktopMinWidth} and ${
  theme.units.multiColumnMaxWidthExpanded
} {
    flex-direction: column;
    align-items: center;
    padding-top: 5px;
    padding-bottom: 5px;

    > * {
      padding-top: 5px;
      padding-bottom: 5px;
    }
  }
`;

export default Multicolumn;
