import Entity from 'services/Entity';
import {
  NEPTUNE_URL_PREFIX,
  TRITON_URL_PREFIX,
  TRITON_PLATFORM_NAME,
  CONTACT_EMAIL_ADDRESS,
  CONTACT_NAME,
  fetchApi,
  getAuthorization,
  handleApiResponse,
} from './config';

import getKind from 'utils/getKind';

enum UserType {
  user = 'user',
  superAdmin = 'super_admin',
}

export interface UserEntity extends Entity {
  name: string;
  email: string;
  phone_number: string;
  user_type: UserType;
  owned_teams: string[];
  owned_organizations: string[];
  receive_email: boolean;
  receive_sms: boolean;
  consent: boolean;
  recent_program_id: string;
}

export const getDefaultUser = ({
  uid = '',
  name = '',
  email = '',
  owned_teams = [],
  phone_number = '',
  receive_email = true,
  receive_sms = true,
  user_type = 'user',
} = {}) => ({
  uid,
  name,
  email,
  owned_teams,
  phone_number,
  receive_email,
  receive_sms,
  user_type,
});

export const queryByTeam = teamId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/users`;

  return fetchApi(url, options);
};

export const queryByOrganization = orgId => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/organizations/${orgId}/users`;

  return fetchApi(url, options);
};

export const get = uid => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/users/${uid}`;

  return fetchApi(url, options);
};

export const getByTeam = (teamId, userId) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/teams/${teamId}/users/${userId}`;

  return fetchApi(url, options);
};

export const getByEmail = email => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: getAuthorization(),
    },
  };

  const url = `${TRITON_URL_PREFIX}/api/accounts/${email}`;

  return fetchApi(url, options);
};

export const invite = (user, inviter, invitedTo) => {
  const kind = getKind(invitedTo.uid);
  if (!['Organization', 'Team'].includes(kind)) {
    throw new Error('Must invite the user to an org or team.');
  }
  const idParam = `${kind.toLowerCase()}_id`;

  // POST //neptune/api/invitations
  const neptuneBody = {
    email: user.email,
    platform: TRITON_PLATFORM_NAME,
    template_content: {
      inviter_name: inviter.name,
      inviter_email: inviter.email,
      team_name: invitedTo.name,
      contact_email_address: CONTACT_EMAIL_ADDRESS,
    },
    from_address: CONTACT_EMAIL_ADDRESS,
    reply_to: CONTACT_EMAIL_ADDRESS,
    from_name: CONTACT_NAME,
    domain: TRITON_URL_PREFIX,
    // Needed to get 200 response from server, used for other system
    // TODO remove when issue #220 is resolved
    continue_url: '',
  };
  const neptuneUrl = `${NEPTUNE_URL_PREFIX}/api/invitations`;
  const neptuneOptions = {
    method: 'POST',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(neptuneBody),
  };
  return fetch(neptuneUrl, neptuneOptions)
    .then(handleApiResponse)
    .then((response: any) => {
      // POST //triton/api/invitations
      // -------------------------------
      // * uid (user id)
      // * email
      // * name
      // * phone_number
      // * team_id
      const tritonBody = {
        user_id: response.uid,
        ...user,
        [idParam]: invitedTo.uid, // either team_id or organization_id
      };
      const tritonUrl = `${TRITON_URL_PREFIX}/api/invitations`;
      const tritonOptions = {
        method: 'POST',
        headers: {
          Authorization: getAuthorization(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tritonBody),
      };

      return fetch(tritonUrl, tritonOptions);
    })
    .then(handleApiResponse);
};

export const update = (user = { uid: '' }) => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: getAuthorization(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  };

  const url = `${TRITON_URL_PREFIX}/api/users/${user.uid}`;

  return fetchApi(url, options);
};
