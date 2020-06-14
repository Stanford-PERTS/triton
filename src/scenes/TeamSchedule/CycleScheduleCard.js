import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import selectors from 'state/selectors';

import CycleRangePicker from './CycleRangePicker';

import Button from 'components/Button';
import DeleteButton from 'components/DeleteButton';
import FakeLink from 'components/FakeLink';
import HelpMeIcon from 'components/HelpMeIcon';
import InfoBox from 'components/InfoBox';
import TeamResponses from 'components/TeamResponses';

import { DatePicker, Progress } from 'antd';

import { dateFormat } from 'config';

import isOverdue from 'utils/isOverdue';
import { toTeamScheduleCycleResponse } from 'routes';

class CycleScheduleCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { teamResponsesOpen: false };
  }

  toggleTeamResponses = event => {
    event.preventDefault(); // this is an <a>, but don't want to navigate
    this.setState({ teamResponsesOpen: !this.state.teamResponsesOpen });
  };

  hasOverlapError = error =>
    Boolean(error && error.message.includes('Cycle dates overlap'));

  meetingDisabledDate = date => {
    const { isWithinCurrentCycle } = this.props;
    return !isWithinCurrentCycle(date);
  };

  journalDisabledDate = date => {
    const { cycle, isWithinCurrentCycle } = this.props;
    return !isWithinCurrentCycle(date) || date < cycle.meeting_date;
  };

  render() {
    /* eslint complexity: "off" */
    const {
      // meta, handlers
      apiError,
      hasCaptainPermission,
      onCycleDateChange,
      onMeetingDateChange,
      onJournalDateChange,
      isWithinOtherCycle,
      isWithinCurrentCycle,
      removeCycle,
      // data
      cycle,
      isCycleActive,
      teamParticipationPercent,
      teamResponses,
      teamResponsesPercent,
      teamUsers,
      userParticipationPercent,
      userResponse,
    } = this.props;

    const responseId = userResponse ? userResponse.uid : 'new';
    const overdue = !userResponse && isOverdue(cycle.resolution_date);

    return (
      <div className="CycleScheduleCard">
        {hasCaptainPermission && (
          <section className="CycleDates">
            <h3>Cycle Dates:</h3>
            <CycleRangePicker
              value={[cycle.start_date, cycle.end_date]}
              format={dateFormat}
              allowClear={false}
              disabled={!hasCaptainPermission}
              save={onCycleDateChange}
              disabledDate={isWithinOtherCycle}
            />
            {this.hasOverlapError(apiError) && (
              <InfoBox error>These dates overlap with other cycles.</InfoBox>
            )}
          </section>
        )}

        <section className="CycleParticipation">
          <h3>Survey Completion</h3>
          <table>
            <tbody>
              <tr>
                <td className="title">My Students</td>
                <td className="progress">
                  <Progress percent={userParticipationPercent} />
                </td>
                {/* not implemented yet
                {isCycleActive && (
                  <td className="link">
                    <a href="/not_implemented">View</a>
                  </td>
                )}
                */}
              </tr>
              <tr>
                <td className="title">Team Students</td>
                <td className="progress">
                  <Progress percent={teamParticipationPercent} />
                </td>
                {/* not implemented yet
                {isCycleActive && (
                  <td className="link">
                    <a href="/not_implemented">View</a>
                  </td>
                )}
                */}
              </tr>
            </tbody>
          </table>
        </section>

        <section className="CycleTeamMeeting">
          <h3>Team Meeting</h3>
          <div className="CycleTeamMeetingActions">
            <div className={isOverdue(cycle.meeting_date) ? 'overdue' : ''}>
              Meeting Date:{' '}
              <DatePicker
                value={cycle.meeting_date}
                format={dateFormat}
                allowClear={false}
                disabled={!hasCaptainPermission}
                onChange={onMeetingDateChange}
                disabledDate={this.meetingDisabledDate}
              />
              {hasCaptainPermission &&
                cycle.meeting_date &&
                !isWithinCurrentCycle(cycle.meeting_date) && (
                  <InfoBox error>
                    <i className="fa fa-warning" />
                    Meeting date should be within cycle dates.
                  </InfoBox>
                )}
            </div>
          </div>
        </section>

        <section className="CycleTeacherReflections">
          <h3>
            Practice Journal
            <HelpMeIcon>
              Teachers&rsquo; individual reflection on the past cycle and
              planned strategies for the coming cycle; submitted below.
            </HelpMeIcon>
          </h3>

          <div className="CycleTeacherReflectionsActions">
            <div className="row">
              <div className="col col-grow">
                <div className={overdue ? 'overdue' : ''}>
                  Due Date:{' '}
                  <DatePicker
                    value={cycle.resolution_date}
                    format={dateFormat}
                    allowClear={false}
                    disabled={!hasCaptainPermission}
                    onChange={onJournalDateChange}
                    disabledDate={this.journalDisabledDate}
                  />
                  {overdue && <span className="overdue">overdue</span>}
                </div>
                {hasCaptainPermission &&
                  cycle.resolution_date &&
                  !isWithinCurrentCycle(cycle.resolution_date) && (
                    <InfoBox error>
                      <i className="fa fa-warning" />
                      Resolution due date should be within cycle dates.
                    </InfoBox>
                  )}
              </div>
            </div>
          </div>

          {hasCaptainPermission && (
            <table>
              <tbody>
                <tr>
                  <td className="title">Teachers Completed</td>
                  <td className="progress">
                    <Progress percent={teamResponsesPercent} />
                  </td>
                  {isCycleActive && hasCaptainPermission && (
                    <td className="link">
                      <FakeLink onClick={this.toggleTeamResponses}>
                        {this.state.teamResponsesOpen ? 'Hide' : 'View'}
                      </FakeLink>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          )}

          {this.state.teamResponsesOpen && (
            <div className="row TeamResponsesRow">
              <TeamResponses
                teamResponses={teamResponses}
                teamUsers={teamUsers}
              />
            </div>
          )}

          <div className="row">
            <div className="col col-grow">
              {userResponse && (
                <Link
                  to={toTeamScheduleCycleResponse(
                    cycle.team_id,
                    cycle.uid,
                    responseId,
                  )}
                >
                  <Button>
                    View Your Practice Journal
                    <i className="fa fa-eye" />
                  </Button>
                </Link>
              )}
              {!userResponse && (
                <Link
                  to={toTeamScheduleCycleResponse(
                    cycle.team_id,
                    cycle.uid,
                    responseId,
                  )}
                >
                  <Button>
                    Complete Your Practice Journal
                    <i className="fa fa-exclamation-triangle" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {hasCaptainPermission && (
          <section>
            <hr />
            <DeleteButton
              initialText="Are you sure you want to delete this cycle?"
              confirmationText={
                "Once you delete a cycle, there's no way to undo."
              }
              loading={false}
              loadingText={`Deleting Cycle`}
              onClick={removeCycle}
            >
              Delete Cycle
            </DeleteButton>
          </section>
        )}
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    apiError: selectors.error.cycles(state, props),
  };
}

export default connect(mapStateToProps)(CycleScheduleCard);
