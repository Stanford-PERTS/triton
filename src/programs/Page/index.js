const Page = ({ children, showWhen }) => (showWhen ? children : null);

Page.defaultProps = {
  showWhen: true,
};

export default Page;
