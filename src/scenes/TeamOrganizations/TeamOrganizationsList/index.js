import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

import * as routes from 'routes';
import { withTermsContext } from 'components/TermsContext';

import BackButton from 'components/BackButton';
import GetStarted from 'components/GetStarted';
import Loading from 'components/Loading';
import OrganizationMenu from './OrganizationMenu';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import { AttachOrgExplainer } from 'scenes/AttachOrganization';

const TeamOrganizationsList = props => {
  const {
    handleRemoveOrganization,
    isLoading,
    mayEditOrganizations,
    organizations,
    teamId,
    terms,
    toBack,
  } = props;

  return (
    <Section
      className="TeamOrganizationsList"
      dark
      left={<BackButton to={toBack} />}
      title={`Associated ${terms.organizations}`}
      to={mayEditOrganizations ? routes.toAttachOrganization(teamId) : ''}
    >
      {isLoading ? (
        <Loading />
      ) : isEmpty(organizations) ? (
        mayEditOrganizations ? (
          <SectionItem>
            <GetStarted>
              <AttachOrgExplainer />
            </GetStarted>
          </SectionItem>
        ) : (
          <SectionItem>
            No supervising {terms.organizations.toLowerCase()}
          </SectionItem>
        )
      ) : (
        organizations.map(org => (
          <SectionItem key={org.uid}>
            {org.name}
            <OrganizationMenu
              organization={org}
              mayRemoveOrganization={mayEditOrganizations}
              handleRemoveOrganization={handleRemoveOrganization}
              style={{ float: 'right' }}
            />
          </SectionItem>
        ))
      )}
    </Section>
  );
};

TeamOrganizationsList.defaultProps = {
  organizations: [],
};

TeamOrganizationsList.propTypes = {
  organizations: PropTypes.arrayOf(PropTypes.object).isRequired,
  teamId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  mayEditOrganizations: PropTypes.bool.isRequired,
  removingOrganizationId: PropTypes.string,
  handleRemoveOrganization: PropTypes.func.isRequired,
};

export default withTermsContext(TeamOrganizationsList);
