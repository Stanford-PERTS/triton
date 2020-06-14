import React, { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import getLinkRel from 'utils/getLinkRel.js';
import pluralize from 'pluralize';
import styled from 'styled-components';
import * as routes from 'routes';

import PageNav from 'components/PageNav';
import RelationCounts from 'components/RelationCounts';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const CaptainLabel = styled.span`
  margin: 0 20px;
  font-style: italic;
  font-weight: normal;
`;

const TeamsListContent = styled.div`
  display: flex;
  flex-direction: row;

  .team-content {
    flex-direction: column;
  }

  .team-label {
    font-weight: bold;
    font-size: 16px;
  }

  .TeamMenu {
    margin-left: auto;
    align-self: center;
  }
`;

const TeamsListRender = props => {
  const { location, Menu, program, teams, teamsLinks, user } = props;
  const terms = useContext(TermsContext);
  const memberTerm = n => pluralize(terms.member.toLowerCase(), n, true);
  const classTerm = n => pluralize(terms.classroom.toLowerCase(), n, true);

  return (
    <>
      {teams.map(team => (
        <SectionItem
          key={team.uid}
          icon="users"
          to={Menu ? null : routes.toTeam(team.uid)}
        >
          <TeamsListContent>
            <div className="team-content">
              <div className="team-label">
                {team.name}
                {user.uid === team.captain_id ? (
                  <CaptainLabel>{terms.captain}</CaptainLabel>
                ) : null}
              </div>
              <RelationCounts>
                {memberTerm(team.num_users)}
                {program.use_classrooms && (
                  <>; {classTerm(team.num_classrooms)}</>
                )}
              </RelationCounts>
            </div>
            {Menu && <Menu team={team} />}
          </TeamsListContent>
        </SectionItem>
      ))}
      {!isEmpty(teamsLinks) && (
        <PageNav
          location={location}
          searchName="teamsQuery"
          first={getLinkRel(teamsLinks, 'first')}
          previous={getLinkRel(teamsLinks, 'previous')}
          self={getLinkRel(teamsLinks, 'self')}
          next={getLinkRel(teamsLinks, 'next')}
          last={getLinkRel(teamsLinks, 'last')}
        />
      )}
    </>
  );
};

export default TeamsListRender;
