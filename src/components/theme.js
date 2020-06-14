const themeColors = {
  // PERTS Blues
  primary: '#42ade8',
  primaryLight: '#64c3f7',
  secondary: '#283043',
  dark: '#015597',
  secondaryDark: '#1f2637',
  secondaryLight: '#3d435d',
  // Grays
  darkGray: '#4a4a4a',
  gray: '#cccccc',
  mediumGray: '#eaeaea',
  lightGray: '#f8f8f8',
  // Others
  red: '#ae1417',
  green: '#62bd6e',
  black: '#000000',
  white: '#ffffff',
};

const aliases = {
  success: themeColors.green,
  danger: themeColors.red,
  warning: themeColors.red,
  caution: themeColors.red,
  info: themeColors.primary,
};

const allColors = { ...themeColors, ...aliases };

export default {
  ...allColors,
  palette: allColors,
  units: {
    appBarHeight: '72px',
    boldWeight: '600',
    borderRadius: '5px',
    buttonMargin: '8px',
    paragraphSpacing: '14px', // see components/SectionItem/styles.css
    sidebarWidth: '270px',
    desktopMinWidth: '(min-width: 800px)',
    formCollapseMinWidth: '(min-width: 1034px)',
    mobileMaxWidth: '(max-width: 799px)',
    // Takes into account the expanding or collapsing of the application side
    // bar. If the side bar is open (at > mobileMaxWidth) the content pane may
    // actually be quite narrow, and need some responsiveness.
    multiColumnMaxWidthCollapsed: '(max-width: 650px)',
    multiColumnMaxWidthExpanded: '(max-width: 950px)',
  },
  boxShadow: '5px 5px 15px 0px rgba(0,0,0,0.2);',
  boxShadowFocus: `0 0 3px 1px ${themeColors.black}`,
  boxShadowFocusInverse: `0 0 3px 2px ${themeColors.white}`,
  zIndex: {
    // ant-d applies z-index: 1 to some icons, and the app bar dropdown has
    // z-index: 11, so this should be between those.
    applicationBar: 8,
    // CaptainOnly component pieces should be lower than the ApplicationBar, so
    // that it can scroll under it.
    captainOnlyImage: 5,
    captainOnlyTextHover: 4,
    captainOnlyText: 3,
  },
};
