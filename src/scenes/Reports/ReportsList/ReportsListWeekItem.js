import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import getKind from 'utils/getKind';

import Icon from 'components/Icon';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';

const ReportsListWeekItem = props => {
  const { report } = props;
  const terms = useContext(TermsContext);
  const reportKind = getKind(report.parent_id);

  const prefixes = {
    Team: terms.team,
    Classroom: terms.classroom,
  };

  return (
    <SectionItem
      to={report.link}
      target="_blank"
      rel="noopener noreferrer"
      data-test={report.parent_id}
    >
      {report.preview && <Icon names="eye" style={{ marginRight: '10px' }} />}
      {/*
        `report.name` is generated in the selectors reports.team.teamReports
        and reports.team.classroomReports
       */}
      {prefixes[reportKind]}: {report.name}
    </SectionItem>
  );
};

export default ReportsListWeekItem;

ReportsListWeekItem.propTypes = {
  report: PropTypes.object.isRequired,
};
