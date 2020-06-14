import React, { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';

import fromParams from 'utils/fromParams';
import * as routes from 'routes';

import Link from 'components/Link';
import GetStarted from 'components/GetStarted';
import Card from 'components/Card';
import TermsContext from 'components/TermsContext';

const CycleProgressEmpty = props => {
  const { classroomsById, contactClassroomsById, participantsById } = props;
  const { scope } = fromParams(props);
  const terms = useContext(TermsContext);

  return (
    <Card>
      <Card.Content>
        <GetStarted noarrow>
          <p>
            <strong>
              {scope === 'user' && isEmpty(contactClassroomsById) ? (
                <span data-test="no-classrooms-user">
                  You&rsquo;re not the {terms.contact.toLowerCase()} of any{' '}
                  {terms.classrooms.toLowerCase()} yet.
                </span>
              ) : scope === 'team' && isEmpty(classroomsById) ? (
                <span data-test="no-classrooms-team">
                  There aren&rsquo;t any {terms.classrooms.toLowerCase()} yet.
                </span>
              ) : scope === 'user' && isEmpty(participantsById) ? (
                <span data-test="no-participants-user">
                  There are no students in your {terms.classrooms.toLowerCase()}{' '}
                  yet.
                </span>
              ) : scope === 'team' && isEmpty(participantsById) ? (
                <span data-test="no-participants-team">
                  There aren&rsquo;t any students yet.
                </span>
              ) : (
                <span data-test="unexpected">No data yet.</span>
              )}{' '}
              There are no students to display.
            </strong>
          </p>
          <p>
            Go to{' '}
            <Link to={routes.toTeamClassrooms()}>
              <strong>{terms.classrooms}</strong>
            </Link>{' '}
            to get started.
          </p>
        </GetStarted>
      </Card.Content>
    </Card>
  );
};

export default CycleProgressEmpty;
