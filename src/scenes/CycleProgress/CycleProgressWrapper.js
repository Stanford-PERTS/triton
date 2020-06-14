import React from 'react';

import * as routes from 'routes';
import fromParams from 'utils/fromParams';
import { dateFormatTitle } from 'config';

import BackButton from 'components/BackButton';
import Card from 'components/Card';

const CycleProgressWrapper = props => {
  const { children, cycle } = props;
  const { teamId, stepType, parentLabel, scope } = fromParams(props);
  const toBack = routes.toProgramStep(teamId, stepType, parentLabel);
  return (
    <>
      <Card>
        <Card.Header dark left={toBack && <BackButton to={toBack} />}>
          Survey Progress: {scope === 'team' ? 'All' : 'Your'} Students
          <br />
          Cycle {cycle.ordinal}
          {cycle.start_date && cycle.end_date && (
            <>
              {' '}
              : {cycle.start_date.format(dateFormatTitle)} -{' '}
              {cycle.end_date.format(dateFormatTitle)}
            </>
          )}
        </Card.Header>
        {children}
      </Card>
      {/* Overrides the max-width set in components/ApplicationWrapper. */}
      <style>{'.MainContent { max-width: 1200px }'}</style>
    </>
  );
};

export default CycleProgressWrapper;
