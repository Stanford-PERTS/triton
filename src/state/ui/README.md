# Flash Messages

To prepare/configure a flash message:

```js
// add the following to state/ui/messages.js:

// This is the flashKey, used in the dispatched action, selector and FlashMessage
// component.
export const INVITE_USERS_KEY = 'INVITES_USERS_KEY';

// This is the messageKey, used to reference which message you'd like to display
// in the dispatched action (as message).
export const INVITE_USERS_SUCCESS_SINGLE = 'INVITE_USERS_SUCCESS_SINGLE';

// This is the component that will end up being rendered by <FlashMessage />.
// Note: The name of this component must match the messageKey name with
// '_COMPONENT' appended.
export const INVITE_USERS_SUCCESS_SINGLE_COMPONENT = () => (
  <span>An invitation has been sent.</span>
);
```

To activate a flash message, dispatch an action like:

```js
// dispatch in a saga (most likely method)

import * as uiTypes from 'state/ui/actionTypes';
import * as messages from 'state/ui/messages';

yield put({
  type: uiTypes.FLASH_SET,
  flashKey: messages.INVITE_USERS_KEY,
  messageKey: messages.INVITE_USERS_SUCCESS_SINGLE,
  // optional, time in milliseconds to display message (default is 10 * 1000)
  // time: 10 * 1000,
});

// in an scene

import { flashSet } from 'state/ui/actions';
import * as messages from 'state/ui/messages';

flashSet({
  flashKey: messages.INVITE_USERS_KEY,
  messageKey: messages.INVITE_USERS_SUCCESS_SINGLE,
  // optional, time in milliseconds to display message (default is 10 * 1000)
  // time: 10 * 1000,
});
```

To display the flash message:

```js
import React from 'react';
import * as messages from 'state/ui/messages';
import FlashMessage from 'components/FlashMessage';

export const ExampleScene = () => (
  <div>
    <FlashMessage flashKey={messages.INVITE_USERS_KEY} />
  </div>
);

```
