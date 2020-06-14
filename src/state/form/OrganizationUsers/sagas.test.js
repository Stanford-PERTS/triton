import { expectSaga } from 'redux-saga-test-plan';

import formAction from 'state/form/OrganizationUsers/actions';
import organizationUsersForm from './sagas';
import * as routes from 'routes';
import * as uiActions from 'state/ui/actions';
import * as usersActions from 'state/users/actions';
import * as usersTypes from 'state/users/actionTypes';
import * as sharedActions from 'state/shared/actions';
import * as sharedTypes from 'state/shared/actionTypes';

describe('OrganizationUsers form sagas', () => {
  const organization = {
    uid: 'Organization_001',
    name: 'Viper Corp',
  };

  it('should handle inviting user to org', () => {
    const invitee = {
      uid: 'User_001',
      name: 'Vinnie Viper',
      owned_organizations: [],
    };

    const inviter = {
      uid: 'User_002',
      name: 'Callie Cobra',
      owned_organizations: ['Organization_001'],
    };

    const action = {
      type: formAction.REQUEST,
      payload: {
        formValues: {
          isInviting: true,
          isRemoving: false,
          user: invitee,
          organization,
        },
      },
    };

    return (
      expectSaga(organizationUsersForm, action)
        // NOTE: I don't seem to be able to get the following select provider
        // working, so I'm mocking state instead.
        // .provide([[select(selectors.auth.user), inviter]])
        .withState({
          auth: { user: inviter },
          entities: {
            users: {
              byId: { [invitee.uid]: invitee, [inviter.uid]: inviter },
            },
          },
        })
        .put(
          usersActions.inviteOrganizationUser(invitee, inviter, organization),
        )
        .dispatch({ type: usersTypes.INVITE_ORGANIZATION_USER_SUCCESS })
        .put(formAction.success())
        .run()
    );
  });

  it('should handle removing user from org', () => {
    const removee = {
      uid: 'User_001',
      name: 'Vinnie Viper',
      owned_organizations: ['Organization_001'],
    };

    const action = {
      type: formAction.REQUEST,
      payload: {
        formValues: {
          isInviting: false,
          isRemoving: true,
          user: removee,
          organization,
        },
      },
    };

    return expectSaga(organizationUsersForm, action)
      .withState({
        // User being removed is also authenticated user. This allows us to test
        // that the optional redirect is also dispatched.
        auth: { user: removee },
        entities: { users: { byId: { [removee.uid]: removee } } },
      })
      .put(sharedActions.removeOrganizationUser(organization, removee))
      .dispatch({ type: sharedTypes.REMOVE_ORGANIZATION_USER_SUCCESS })
      .put(formAction.success())
      .put(uiActions.redirectTo(routes.toRoot()))
      .run();
  });
});
