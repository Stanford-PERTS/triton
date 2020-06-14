import React from 'react';
import PropTypes from 'prop-types';

import _keys from 'lodash/keys';

import Section from 'components/Section';
import SectionItem from 'components/SectionItem';
import ReportsListWeek from './ReportsListWeek';

export const ReportsListNoReports = () => (
  <span>
    You don&rsquo;t have any reports available. Reports are issued once a week
    once you start collecting data.
  </span>
);

// Sort reports by week, most recent first.
const sortedWeeks = reports =>
  _keys(reports)
    .sort()
    .reverse();

const ReportsList = props => {
  const { reportsByWeek } = props;
  const weeks = sortedWeeks(reportsByWeek);

  return (
    <>
      {weeks.length > 0 ? (
        weeks.map(week => (
          <ReportsListWeek
            key={week}
            reports={reportsByWeek[week]}
            week={week}
          />
        ))
      ) : (
        <Section title="No Reports Yet">
          <SectionItem>
            <ReportsListNoReports />
          </SectionItem>
        </Section>
      )}
    </>
  );
};

export default ReportsList;

ReportsList.propTypes = {
  // Reports, indexed by week (YYYY-MM-DD), to display.
  reportsByWeek: PropTypes.object.isRequired,
};
