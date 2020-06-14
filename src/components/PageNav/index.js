import React from 'react';
import PropTypes from 'prop-types';

import uri from 'urijs';
import mapValues from 'lodash/mapValues';
// import forOwn from 'lodash/forOwn';

import Icon from 'components/Icon';
import CenteredRow from 'components/CenteredRow';
import PageNavLink from './PageNavLink';

/**
 * PageNav - a row of buttons for paging through a list: << < o > >>
 * Based on canonical structure of a Link response header. Takes just the query
 * strings from such a header and creates links to the current page with those
 * query parameters added.
 * @param {Object} props with location and each rel's query params.
 * @returns {Object} jsx
 */
const PageNav = props => {
  const { location, searchName, ...rels } = props;
  const { first, previous, self, next, last } = mapValues(rels, coerceRelNums);
  const pageNumbers = []; // will populate numbered links

  if (last) {
    // Figure out how many pages there are, and construct a rel-like object
    // for each.
    // ceil() b/c pages of length less than n still count as pages.
    const lastPageIndex = Math.ceil(last.cursor / last.n);
    for (let x = 0; x <= lastPageIndex; x += 1) {
      pageNumbers.push({ n: last.n, cursor: x * last.n });
    }
  }

  function coerceRelNums(rel) {
    if (!rel) {
      return {};
    }
    const { n = 10, cursor = 0, ...rest } = rel;
    return { n: Number(n), cursor: Number(cursor), ...rest };
  }

  function getTo(relParams) {
    return uri(location.pathname + location.search + location.hash)
      .setSearch(searchName, JSON.stringify(relParams))
      .toString();
  }

  function relActive(rel) {
    return rel.cursor === (self.cursor || 0);
  }

  return (
    <CenteredRow>
      {first && (
        <PageNavLink to={getTo(first)} disabled={relActive(first)}>
          <Icon names="angle-double-left" />
        </PageNavLink>
      )}
      {previous && (
        <PageNavLink to={getTo(previous)} disabled={relActive(previous)}>
          <Icon names="angle-left" />
        </PageNavLink>
      )}
      {pageNumbers.map((page, i) => (
        <PageNavLink key={i} to={getTo(page)} active={relActive(page)}>
          {i + 1}
        </PageNavLink>
      ))}
      {next && (
        <PageNavLink to={getTo(next)} disabled={relActive(next)}>
          <Icon names="angle-right" />
        </PageNavLink>
      )}
      {last && (
        <PageNavLink to={getTo(last)} disabled={relActive(last)}>
          <Icon names="angle-double-right" />
        </PageNavLink>
      )}
    </CenteredRow>
  );
};

PageNav.propTypes = {
  location: PropTypes.object,
  first: PropTypes.objectOf(PropTypes.string),
  previous: PropTypes.objectOf(PropTypes.string),
  self: PropTypes.objectOf(PropTypes.string),
  next: PropTypes.objectOf(PropTypes.string),
  last: PropTypes.objectOf(PropTypes.string),
};

export default PageNav;
