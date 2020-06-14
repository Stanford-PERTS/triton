import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { Field, InjectedFormProps } from 'redux-form';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import FormActions from 'components/Form/FormActions';
import FormSubmitButton from 'components/Form/FormSubmitButton';
import FormSubmitFailed from 'components/Form/FormSubmitFailed';
import FormSubmitSucceeded from 'components/Form/FormSubmitSucceeded';
import InfoBox from 'components/InfoBox';
import MainContactSection from './MainContactSection.js';
import TextField from 'components/Form/TextField';
import { Terms } from 'components/TermsContext';
import { ClassroomEntity } from 'services/triton/classrooms';
import { TeamEntity } from 'services/triton/teams';
import { UserEntity } from 'services/triton/users';

type Props = {
  actions: {
    removeClassroom: Function;
  };
  captain: UserEntity;
  classroom: ClassroomEntity;
  contact: UserEntity;
  defaultContact: UserEntity;
  deleteRedirect: string;
  hasCaptainPermission: boolean;
  parentLabel?: string;
  stepType?: string;
  team: TeamEntity;
  teamUserNamesById: { [key: string]: string };
  terms: Terms;
  toBack: string;
  user: UserEntity;
  // not sure where these are from
  submitting: boolean;
};

const SettingsRender: React.FC<Props & InjectedFormProps> = props => {
  const {
    // Props
    actions: { removeClassroom },
    captain,
    classroom,
    contact,
    defaultContact,
    deleteRedirect,
    hasCaptainPermission,
    team,
    teamUserNamesById,
    terms,
    toBack,
    user,
    // redux-form
    form,
    handleSubmit,
    invalid,
    pristine,
    // ?
    submitting,
  } = props;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <Card.Header
            dark
            left={<BackButton to={toBack} label={!pristine && 'Cancel'} />}
          >
            {isEmpty(classroom) ? (
              <>New {terms.classroom}</>
            ) : (
              <>Other {terms.classroom} Settings</>
            )}
          </Card.Header>
          <Card.Content>
            <Field
              component={TextField}
              name="name"
              label={`${props.terms.classroom} Name`}
              placeholder="Enter Name"
              type="text"
              data-test="name"
            />
          </Card.Content>
          <MainContactSection
            captain={captain}
            captainTerm={terms.captain}
            contact={contact}
            contactTerm={terms.contact}
            defaultContact={defaultContact}
            hasCaptainPermission={hasCaptainPermission}
            user={user}
            teamUserNamesById={teamUserNamesById}
          />
          <Card.Content>
            <Field
              name="grade_level"
              type="text"
              label="Grade Level (optional)"
              component={TextField}
              placeholder="Grade Level"
              data-test="grade_level"
            />
          </Card.Content>
          <Card.Content>
            <FormSubmitButton
              disabled={pristine || invalid}
              handleSubmit={handleSubmit}
              submitting={submitting}
              submittingText="Saving Changes"
            >
              Save Changes
            </FormSubmitButton>
            <FormSubmitSucceeded form={form}>
              <InfoBox success>Settings saved.</InfoBox>
            </FormSubmitSucceeded>

            <FormSubmitFailed form={form}>
              {/* Using the error provided by redux-form-saga */}
            </FormSubmitFailed>
          </Card.Content>
        </Card>
      </form>
      {true && (
        <FormActions
          deleting={false}
          displayEntity={terms.classroom}
          handleDelete={() =>
            removeClassroom(classroom, team.uid, deleteRedirect)
          }
          mayDelete={hasCaptainPermission || user.uid === contact.uid}
          mode={isEmpty(classroom) ? 'add' : 'update'}
        />
      )}
    </>
  );
};

export default SettingsRender;
