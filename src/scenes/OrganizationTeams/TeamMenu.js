import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import * as routes from 'routes';
import Dropdown from 'components/Dropdown';
import TermsContext from 'components/TermsContext';

export const TeamMenu = props => {
  const { team } = props;
  const terms = useContext(TermsContext);

  return (
    <Dropdown className="TeamMenu" text="Options">
      <Dropdown.Menu>
        <Dropdown.Header>{team.name}</Dropdown.Header>
        <Dropdown.Item className="to-team-steps">
          <Link to={routes.toProgramSteps(team.uid)} title="team stages">
            Go To {terms.team} Stages
          </Link>
        </Dropdown.Item>
        <Dropdown.Item className="to-team-classrooms">
          <Link to={routes.toTeamClassrooms(team.uid)} title="team classrooms">
            Go To {terms.team} {terms.classrooms}
          </Link>
        </Dropdown.Item>
        <Dropdown.Item className="to-team-reports">
          <Link to={routes.toTeamReports(team.uid)} title="team reports">
            Go To {terms.team} Reports
          </Link>
        </Dropdown.Item>
        <Dropdown.Item className="to-team-details">
          <Link to={routes.toTeamDetails(team.uid)} title="team details">
            Go To {terms.team} Details
          </Link>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

TeamMenu.propTypes = {
  team: PropTypes.object.isRequired,
};

export default withRouter(TeamMenu);
