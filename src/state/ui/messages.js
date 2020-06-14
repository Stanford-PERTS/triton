import React from 'react';

// INVITE USERS
export const INVITE_USERS_KEY = 'INVITES_USERS_KEY';

export const INVITE_USERS_SUCCESS_SINGLE = 'INVITE_USERS_SUCCESS_SINGLE';
export const INVITE_USERS_SUCCESS_SINGLE_COMPONENT = () => (
  <span>An invitation has been sent.</span>
);

export const INVITE_USERS_SUCCESS_MULTIPLE = 'INVITE_USERS_SUCCESS_MULTIPLE';
export const INVITE_USERS_SUCCESS_MULTIPLE_COMPONENT = () => (
  <span>Invitations have been sent.</span>
);

// CYCLE REMOVE
export const CYCLE_REMOVE_SUCCESS_KEY = 'CYCLE_REMOVE_SUCCESS_KEY';
export const CYCLE_REMOVE_SUCCESS_MSG = 'CYCLE_REMOVE_SUCCESS_MSG';
export const CYCLE_REMOVE_SUCCESS_MSG_COMPONENT = () => (
  <span>The cycle has been removed.</span>
);
