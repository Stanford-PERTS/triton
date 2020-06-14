import React from 'react';

import BackButton from 'components/BackButton';
import Section from 'components/Section';

const ClassroomsListWrapper = props => {
  const { children, newClassroomRoute, title, toBack } = props;
  return (
    <Section
      className="ClassroomsList"
      dark
      left={toBack && <BackButton to={toBack} />}
      title={title}
      to={newClassroomRoute}
    >
      {children}
    </Section>
  );
};

export default ClassroomsListWrapper;
