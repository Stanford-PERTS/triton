// This DebugModule is available in case we need a way to see what data is being
// made available to Modules components on live.
//
// Usage, add this to a program config:
//   <Task type="module" title="Debug Module" label="DebugModule" />

import React from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import * as routes from 'routes';
import fromParams from 'utils/fromParams';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import SceneTitle from 'components/SceneTitle';

const DebugModule = props => {
  const { team } = props;
  const { stepType, parentLabel } = fromParams(props);

  const back = team && routes.toProgramStep(team.uid, stepType, parentLabel);

  return (
    <div>
      <SceneTitle title="Debug Module" left={<BackButton to={back} />} />
      <Card title="Data Properties">
        <Card.Content>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </Card.Content>
      </Card>
    </div>
  );
};

export default compose(withRouter)(DebugModule);
