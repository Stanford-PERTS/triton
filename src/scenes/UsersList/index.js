import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const UsersList = props => {
  const { newUserRoute, title, users } = props;
  return (
    <Section title={title} to={newUserRoute} className="UsersList">
      {!isEmpty(users) &&
        users.map(user => (
          <SectionItem key={user.uid}>
            <span>
              {user.name} {user.email && `\xa0(${user.email})`}
            </span>
          </SectionItem>
        ))}
    </Section>
  );
};

UsersList.propTypes = {
  newUserRoute: PropTypes.string,
  title: PropTypes.string,
  users: PropTypes.arrayOf(PropTypes.object),
};

export default UsersList;
