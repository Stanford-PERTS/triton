import React from 'react';
import { Switch, Route } from 'react-router-dom';
import fromParams from 'utils/fromParams';
import * as routes from 'routes';

import { RenderChildrenWithContext } from 'programs/contexts';
import ProgramData from 'programs/ProgramData';
import ProgramDisplay from 'programs';

import ClassroomDetails from 'scenes/ClassroomDetails';
import ClassroomNew from 'scenes/ClassroomNew';
import ClassroomSettings from 'scenes/ClassroomSettings';
import CycleProgress from 'scenes/CycleProgress';
import RosterAdd from 'scenes/RosterAdd';
import SurveyInstructions from 'scenes/SurveyInstructions';
import TeamClassrooms from 'scenes/TeamClassrooms';
import TeamUserInvite from 'scenes/TeamUserInvite';
import TeamUsers from 'scenes/TeamUsers';
import UserDetails from 'scenes/UserDetails';

const TeamTasklist = props => {
  const { teamId } = fromParams(props);

  return (
    <ProgramData teamId={teamId}>
      <Switch>
        {/*
          Duplicate routes (they are accessible via other navigation routes /
          URLs) that we want to allow access to as "child" routes of program
          task lists (Stages). This way we can allow the user to navigate "back"
          to the task lists view.
        */}
        <Route
          exact
          path={routes.toProgramTeamUserInvite()}
          component={TeamUserInvite}
        />

        <Route
          exact
          path={routes.toProgramTeamUserDetails()}
          component={UserDetails}
        />

        <Route exact path={routes.toProgramTeamUsers()} component={TeamUsers} />

        <Route
          exact
          path={routes.toProgramTeamClassrooms()}
          component={TeamClassrooms}
        />

        <Route
          exact
          path={routes.toProgramTeamClassroomNew()}
          component={ClassroomNew}
        />

        <Route
          exact
          path={routes.toProgramTeamClassroom()}
          component={ClassroomDetails}
        />

        <Route
          exact
          path={routes.toProgramClassroomSettings()}
          component={ClassroomSettings}
        />

        <Route
          exact
          path={routes.toProgramTeamRosterAdd()}
          component={RosterAdd}
        />

        <Route
          exact
          path={routes.toProgramClassroomSurveyInstructions()}
          component={SurveyInstructions}
        />

        <Route
          exact
          path={routes.toCycleProgress()}
          component={CycleProgress}
        />

        {/* Direct display of components from scenes/TaskModules. */}
        <Route
          path={routes.toProgramModule()}
          render={() => (
            <RenderChildrenWithContext display="taskmodule">
              <ProgramDisplay teamId={teamId} />
            </RenderChildrenWithContext>
          )}
        />

        {/* Display of the team's program task list. */}
        <Route
          path={routes.toProgramSteps()}
          render={() => (
            <RenderChildrenWithContext display="tasklist">
              <ProgramDisplay teamId={teamId} />
            </RenderChildrenWithContext>
          )}
        />
      </Switch>
    </ProgramData>
  );
};

export default TeamTasklist;
