import React from 'react';
import { storiesOf, action } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import SelectableCard from 'components/SelectableCard';

storiesOf('SelectableCard', module)
  .add(
    'Default, not selected',
    withInfo(
      'A selectable card. Not selected. This is a UI component only and ' +
        'contains no logic to track selected state.',
    )(() => (
      <SelectableCard selected={false} onClick={action('Card Select Toggle')}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </SelectableCard>
    )),
  )
  .add(
    'Default, selected',
    withInfo(
      'A selectable card. Selected. This is a UI component only and contains ' +
        'no logic to track selected state.',
    )(() => (
      <SelectableCard selected={true} onClick={action('Card Select Toggle')}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </SelectableCard>
    )),
  );
