import React, { useContext } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import getLinkRel from 'utils/getLinkRel.js';
import pluralize from 'pluralize';

import * as routes from 'routes';

import PageNav from 'components/PageNav';
import RelationCounts from 'components/RelationCounts';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const OrganizationsListRender = props => {
  const { location, organizations, organizationsLinks: links } = props;
  const terms = useContext(TermsContext);

  return (
    <>
      {organizations.map(organization => (
        <SectionItem
          key={organization.uid}
          to={routes.toOrganization(organization.uid)}
          icon="university"
        >
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {organization.name}
          </div>
          <RelationCounts>
            {pluralize(terms.team.toLowerCase(), organization.num_teams, true)}
          </RelationCounts>
        </SectionItem>
      ))}

      {!isEmpty(links) && (
        <PageNav
          location={location}
          searchName="organizationsQuery"
          first={getLinkRel(links, 'first')}
          previous={getLinkRel(links, 'previous')}
          self={getLinkRel(links, 'self')}
          next={getLinkRel(links, 'next')}
          last={getLinkRel(links, 'last')}
        />
      )}
    </>
  );
};

export default compose(withRouter)(OrganizationsListRender);
