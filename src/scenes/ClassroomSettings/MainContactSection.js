import React from 'react';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { CONTACT_EMAIL_ADDRESS } from 'services/triton/config';

import Card from 'components/Card';
import SelectField from 'components/Form/SelectField';

export const DEFAULT_CONTACT = {
  name: 'Support',
  email: CONTACT_EMAIL_ADDRESS,
};

const MainContactSection = props => {
  const {
    captain,
    captainTerm,
    contact,
    contactTerm,
    defaultContact,
    hasCaptainPermission,
    teamUserNamesById,
    user,
  } = props;

  const userIsContact = user.uid === contact.uid;
  const userIsDefaultContact = user.uid === defaultContact.uid;

  const teamUsersOptions = map(teamUserNamesById, (name, uid) => [uid, name]);

  return (
    <Card.Content>
      {hasCaptainPermission ? (
        <Field
          name="contact_id"
          label={contactTerm}
          options={teamUsersOptions}
          component={SelectField}
        />
      ) : (
        <div data-test="contact-message">
          {userIsDefaultContact ? (
            <div data-test="you-will-be-contact">
              {/* Applicable for new classrooms only. */}
              You ({user.email}) will be the {contactTerm.toLowerCase()} for
              this classroom.
            </div>
          ) : userIsContact ? (
            <div data-test="you-are-contact">
              <p>
                You ({user.email}) are the {contactTerm.toLowerCase()} for this
                classroom.
              </p>
              <p>
                Speak to your {captainTerm.toLowerCase()} ({captain.email}) if
                you&rsquo;d like to change this.
              </p>
            </div>
          ) : (
            <p data-test="contact-is">
              Main Contact: {contact.name} ({contact.email})
            </p>
          )}
        </div>
      )}
    </Card.Content>
  );
};

MainContactSection.propTypes = {
  captain: PropTypes.object,
  captainTerm: PropTypes.node,
  contact: PropTypes.object,
  contactTerm: PropTypes.node,
  defaultContact: PropTypes.object,
  hasCaptainPermission: PropTypes.bool,
  teamUserNamesById: PropTypes.objectOf(PropTypes.string),
  user: PropTypes.object,
};

MainContactSection.defaultProps = {
  captain: {},
  contact: {},
  defaultContact: {},
  hasCaptainPermission: false,
  user: {},
};

export default MainContactSection;
