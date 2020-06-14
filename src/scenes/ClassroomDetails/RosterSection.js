import React, { useContext, useState } from 'react';
import pluralize from 'pluralize';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as participantsActions from 'state/participants/actions';

import AddButton from 'components/AddButton';
import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import ClassroomRosterGetStarted from './ClassroomRosterGetStarted';
import Modal from 'components/Modal';
import Section from 'components/Section';
import SectionDeleteButton from 'components/SectionDeleteButton';
import SectionItem from 'components/SectionItem';
import TermsContext from 'components/TermsContext';
import ToggleField, { ToggleFieldStyled } from 'components/Form/ToggleField';

export const RosterTable = styled.table`
  width: 100%;

  thead {
    border-bottom: 1px solid black;

    tr:last-child {
      th {
        padding-bottom: 10px;
      }
    }
  }

  tbody {
    tr:first-child {
      td {
        padding-top: 10px;
      }
    }
  }

  th,
  td {
    text-align: center;
  }

  ${ToggleFieldStyled} {
    justify-content: center;
  }
`;

const targetGroupFieldName = p => `${p.student_id}:in_target_group`;

const RosterSection = props => {
  const {
    mayAddOrRemove,
    participants,
    targetGroupActive,
    // Not currently used, but maybe should be. See note below.
    // updatingParticipants,
    toAdd,
  } = props;
  const terms = useContext(TermsContext);

  const [confirmRemove, setConfirmRemove] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleTargetGroup = (pid, bool) => {
    const { updateParticipant } = props.actions;
    const participant = participants.find(p => p.uid === pid);
    participant.in_target_group = Boolean(bool);
    updateParticipant(participant);
  };

  const removeSelected = () => {
    const { classroom } = props;
    const { removeParticipantsAndRecount } = props.actions;

    const toRemove = participants.filter(p => selectedIds.includes(p.uid));
    removeParticipantsAndRecount(toRemove, classroom.uid);
    setConfirmRemove(false); // close modal
  };

  const selectAll = event => {
    if (event.target.checked) {
      setSelectedIds(participants.map(p => p.uid));
    } else {
      setSelectedIds([]);
    }
  };

  const selectParticipant = (pid, event) => {
    if (event.target.checked) {
      setSelectedIds([...selectedIds, pid]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== pid));
    }
  };

  const rosterSectionTitle = `Roster (${pluralize(
    'Participant',
    participants.length,
    true,
  )})`;

  return (
    <Section
      title={rosterSectionTitle}
      right={
        mayAddOrRemove ? (
          <>
            <SectionDeleteButton
              disabled={selectedIds.length === 0}
              onClick={() => setConfirmRemove(true)}
            />
            <AddButton to={toAdd} dark={false} />
          </>
        ) : null
      }
    >
      <SectionItem>
        <RosterTable>
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={selectAll} />
              </th>
              <th>Roster ID</th>
              <th># {terms.classrooms}</th>
              <th>{targetGroupActive && 'In Target Group'}</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p.uid}>
                <td>
                  <input
                    type="checkbox"
                    onChange={e => selectParticipant(p.uid, e)}
                    checked={selectedIds.includes(p.uid)}
                  />
                </td>
                <td data-test="student_id">{p.student_id}</td>
                <td>{p.classroom_ids.length}</td>
                <td>
                  {/*
                    N.B. We could do this to be rigorous:
                    disabled={updatingParticipants}
                    but it causes flicker and probably isn't necessary.
                  */}
                  {targetGroupActive && (
                    <ToggleField
                      input={{
                        onChange: e =>
                          toggleTargetGroup(p.uid, e.target.checked),
                        value: p.in_target_group,
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
            {participants.length === 0 && (
              <tr>
                <td colSpan="4">
                  <ClassroomRosterGetStarted />
                </td>
              </tr>
            )}
          </tbody>
        </RosterTable>
      </SectionItem>
      {confirmRemove && (
        <Modal title="Remove Participants?">
          <p>
            Are you sure you&rsquo;d like to remove {selectedIds.length}{' '}
            participant(s)?
          </p>

          <ButtonContainer>
            <Button onClick={removeSelected} caution>
              Remove
            </Button>

            <Button onClick={() => setConfirmRemove(false)} cancel>
              Cancel
            </Button>
          </ButtonContainer>
        </Modal>
      )}
    </Section>
  );
};

const mapStateToProps = (state, props) => ({
  initialValues: props.participants.reduce((acc, p) => {
    acc[targetGroupFieldName(p)] = p.in_target_group;
    return acc;
  }, {}),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(participantsActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RosterSection);
