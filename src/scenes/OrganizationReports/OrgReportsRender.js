import React, { useContext } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import TermsContext from 'components/TermsContext';
import Card from 'components/Card';
import Icon from 'components/Icon';

const displayDate = report => {
  const [dateStr] = /\d{4}-\d{2}-\d{2}/.exec(report.filename);
  return moment(dateStr, 'YYYY-MM-DD')
    .toDate()
    .toLocaleDateString();
};

const OrgReportsRender = props => {
  const terms = useContext(TermsContext);
  const { organization, reports } = props;
  const sortedReports = reports.sort((a, b) =>
    // descending order i.e. newest first
    a.filename < b.filename ? 1 : -1,
  );

  return (
    <Card>
      {sortedReports.map(r => (
        <Card.Content to={r.link} key={r.uid}>
          {r.preview && <Icon names="eye" style={{ marginRight: '10px' }} />}
          {displayDate(r)} {terms.organization} Report for{' '}
          <em>{organization.name}</em>
        </Card.Content>
      ))}
    </Card>
  );
};

export default OrgReportsRender;

OrgReportsRender.propTypes = {
  organization: PropTypes.object.isRequired,
  reports: PropTypes.arrayOf(PropTypes.object).isRequired,
};
