import React from 'react';

import { compose, lifecycle } from 'recompose';
import { withRouter } from 'react-router-dom';
import scrollToTopOnPropChange from 'utils/scrollToTopOnPropChange';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as uiActions from 'state/ui/actions';
import * as routes from 'routes';
import fromParams from 'utils/fromParams';
import { withResponseContext } from 'programs/contexts';

import PagesNavigation from './PagesNavigation';
import Page from 'programs/Page';
import Card from 'components/Card';
import InfoBox from 'components/InfoBox';
import Show from 'components/Show';

const Pages = props => {
  const { teamId, parentLabel, stepType, moduleLabel, page } = fromParams(
    props,
  );
  const {
    children,
    response,
    showProgress,
    form,
    handleSubmit,
    onSubmit,
  } = props;
  const { redirectTo } = props.actions;

  const { totalPages, childrenToDisplay } = countAndFilterPages(children, page);
  const onCompletionPage = page === totalPages;

  const pageNavigationProps = {
    showProgress,
    form,
    handleSubmit,
    onSubmit,
  };

  // When the `page` specified in route params is greater than the total number
  // of pages in the survey, assume there is a mistake or has been a change in
  // survey config and redirect to pageless route so that the below logic can
  // handle which page to send user to.
  if (page > totalPages) {
    redirectTo(
      routes.toProgramModule(teamId, stepType, parentLabel, moduleLabel),
    );

    return null;
  }

  // When there is no `page` specified in route params...
  if (!page) {
    // ...either redirect the user to page 1.
    let continueOnPage = 1;

    // ...or redirect user to the recorded `page` in the response (if the user
    // hasn't already completed the survey/module), so they can continue the
    // survey where they left off.
    if (response && response.page && response.progress !== 100) {
      continueOnPage =
        response.page + 1 <= totalPages ? response.page + 1 : totalPages;
    }

    redirectTo(
      routes.toProgramModulePage(
        teamId,
        stepType,
        parentLabel,
        moduleLabel,
        continueOnPage,
        totalPages,
      ),
    );

    return null;
  }

  // NOTE: It's possible to have children that are displayed that are not a Page
  // and are not counted in the Page count. It is also to hide Page components
  // and have them counted toward the Page count. It's intended that you will
  // only hide/show the Page component by the `showWhen` prop.
  return (
    <>
      <Show when={response && response.progress === 100 && !onCompletionPage}>
        <Card.Content>
          <InfoBox data-test="already-submitted">
            You&rsquo;ve already submitted this, but you can edit your responses
            if you&rsquo;d like.
          </InfoBox>
        </Card.Content>
      </Show>
      <>{childrenToDisplay}</>
      <PagesNavigation {...pageNavigationProps} />
    </>
  );
};

const countAndFilterPages = (children, pageToDisplay) => {
  let totalPages = 0; // also acts as the current Page index

  const recurse = currentChildren =>
    React.Children.map(currentChildren, child => {
      // Nodes that are Page components...
      if (child.type === Page) {
        // ...and that have the `showWhen` prop equal to `true`...
        if (child.props.showWhen) {
          // ... are included in the totalPages count.
          totalPages += 1;
          // Handles only displaying the current Page based on the url/route.
          if (totalPages === pageToDisplay) {
            return child;

            // Note: If we find we need to pass the `page` as a prop to Page.
            // return React.cloneElement(child, { page: totalPages });
          }
        }

        // If the `showWhen` prop is `false`, then we want to throw out those
        // Page components and not count them in `totalPages`.
        return null;
      }

      // Next we handle nodes that are *not* Page components...
      let filteredChild = child;

      // ...by diving into their children, if they have them...
      if (child.props && child.props.children) {
        // ... and counting/filtering Page components (above).
        filteredChild = React.cloneElement(child, {
          // Once the counting/filtering is performed, we want to include the
          // current node, but replace the node's `children` with the filtered
          // children (Page components that should not appear removed).
          children: recurse(child.props.children),
        });
      }

      return filteredChild;
    });

  const childrenToDisplay = recurse(children);

  return { totalPages, childrenToDisplay };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(uiActions, dispatch),
});

export default compose(
  withRouter,
  withResponseContext,
  connect(
    null,
    mapDispatchToProps,
  ),
  lifecycle({
    componentDidUpdate(prevProps) {
      scrollToTopOnPropChange(['page'], prevProps, this.props);
    },
    componentDidMount() {
      scrollToTopOnPropChange(['page'], null, this.props);
    },
  }),
)(Pages);
