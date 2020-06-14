import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Button from 'components/Button';

const CycleLink = ({ to, icon }) =>
  to ? (
    <Link to={to}>
      <Button>
        <i className={icon} />
      </Button>
    </Link>
  ) : (
    <Button disabled={true}>
      <i className={icon} />
    </Button>
  );

const CycleScheduleCarouselTitle = props => {
  const {
    cycle,
    routeFastBackward,
    routeStepBackward,
    routeStepForward,
    routeFastForward,
  } = props;
  return (
    <div className="CycleScheduleCarouselTitle">
      <div className="CycleScheduleCarouselPrev">
        <CycleLink to={routeFastBackward} icon="fa fa-fast-backward" />
        <CycleLink to={routeStepBackward} icon="fa fa-step-backward" />
      </div>
      <div className="CycleScheduleCarouselText">
        <div>Cycle {cycle.ordinal}</div>
        <div>
          {moment(cycle.start_date).format('MMM D')} to{' '}
          {moment(cycle.end_date).format('MMM D, YYYY')}
        </div>
      </div>
      <div className="CycleScheduleCarouselNext">
        <CycleLink to={routeStepForward} icon="fa fa-step-forward" />
        <CycleLink to={routeFastForward} icon="fa fa-fast-forward" />
      </div>
    </div>
  );
};

export default CycleScheduleCarouselTitle;
