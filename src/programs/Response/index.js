// The Response component allows you to grab any user response.
//
// Example usage:
//   <Response
//     responseType="User"
//     userId={user.uid}
//     parentId={cycle.uid}
//     moduleLabel="EPPracticeJournal"
//     name="changes_next_cycle"
//     defaultValue="[You did not answer this question]"
//   />
//
//   <Response
//     responseType="Team"
//     parentId="conclusion"
//     moduleLabel="EPTeamMeetingHeld"
//     name="team_meeting_summary"
//     defaultValue="[You did not answer this question]"
//   />

import { compose, setDisplayName } from 'recompose';
import { withAllContexts } from 'programs/contexts';
import { RESPONSE_TYPE_USER } from 'state/form/TaskModule/actionTypes';
import get from 'lodash/get';

export const Response = ({
  responses,
  responseType = RESPONSE_TYPE_USER,
  userId,
  parentId,
  moduleLabel,
  name,
  defaultValue = null,
}) => {
  const response = responses.find(
    r =>
      r.type === responseType &&
      r.user_id === (responseType === RESPONSE_TYPE_USER ? userId : '') &&
      r.parent_id === parentId &&
      r.module_label === moduleLabel,
  );

  return get(response, `body.${name}.value`, defaultValue);
};

export default compose(
  setDisplayName('Response'),
  withAllContexts,
)(Response);
