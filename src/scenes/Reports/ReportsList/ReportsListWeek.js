import React, { useContext } from 'react';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import PropTypes from 'prop-types';

import getKind from 'utils/getKind';

import Card from 'components/Card';
import ReportsListWeekItem from './ReportsListWeekItem';
import Show from 'components/Show';
import TermsContext from 'components/TermsContext';

const ReportsListNoClassroomReports = () => {
  const terms = useContext(TermsContext);
  return (
    <span>
      You don&rsquo;t have any {terms.classroom.toLowerCase()} reports available
      for this week. Only the {terms.contact.toLowerCase()} for a{' '}
      {terms.classroom.toLowerCase()} may view that{' '}
      {/* possessive, not plural */}
      {terms.classroom.toLowerCase()}&rsquo;s report. Also,{' '}
      {terms.classrooms.toLowerCase()} that haven&rsquo;t collected data in a
      while aren&rsquo;t issued reports.
    </span>
  );
};

// Parse the date in terms of the user's local time, not UTC, otherwise the
// displayed date may be different from expected.
export const formattedDate = date =>
  moment(date, 'YYYY-MM-DD')
    .toDate()
    .toLocaleDateString();

const ReportsListWeek = props => {
  const { reports, week } = props;
  const localDate = formattedDate(week);
  const teamOnly = reports.length === 1 && !reports[0].classroom_id;

  // #1525 to simplify what would otherwise be redundant information, in the
  // specific case where there's one team report and one classroom report to
  // display, hide the team report. RServe will customize this remaining
  // classroom report to further reduce redundancy (e.g. by not displaying
  // team-level data side-by-side).
  const reportTypes = reports
    .map(r => r.parent_id)
    .map(getKind)
    .sort();
  const classroomOnly =
    reports.length === 2 && isEqual(reportTypes, ['Classroom', 'Team']);
  let filteredReports = reports;
  if (classroomOnly) {
    filteredReports = reports.filter(r => getKind(r.parent_id) === 'Classroom');
  }

  return (
    <Card>
      <Card.Header>{localDate}</Card.Header>
      {filteredReports.map(report => (
        <ReportsListWeekItem key={report.uid} report={report} />
      ))}
      <Show when={teamOnly}>
        <Card.Content>
          <ReportsListNoClassroomReports />
        </Card.Content>
      </Show>
    </Card>
  );
};

export default ReportsListWeek;

ReportsListWeek.propTypes = {
  // The week's reports.
  reports: PropTypes.array.isRequired,
  // The week's date (YYYY-MM-DD).
  week: PropTypes.string.isRequired,
};
