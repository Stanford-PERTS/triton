import React from 'react';
import { storiesOf, action } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Button from 'components/Button';

storiesOf('Button', module)
  .add(
    'Default',
    withInfo(`
        A default button.
    `)(() => <Button onClick={action('Button Clicked')}>Save Progress</Button>),
  )
  .add(
    'Secondary',
    withInfo(`
      A secondary button.
    `)(() => (
      <Button secondary onClick={action('Button Clicked')}>
        Save Progress
      </Button>
    )),
  )
  .add(
    'Disabled',
    withInfo(`
      A disabled button.
    `)(() => (
      <Button disabled onClick={action('Button Clicked')}>
        Save Progress
      </Button>
    )),
  )
  .add(
    'Loading',
    withInfo(`
      A loading button.
    `)(() => (
      <Button
        loading
        loadingText="Saving Progress"
        onClick={action('Button Clicked')}
      >
        Save Progress
      </Button>
    )),
  )
  .add(
    'Cancel',
    withInfo(`
      A cancel button.
    `)(() => (
      <Button cancel onClick={action('Button Clicked')}>
        Cancel
      </Button>
    )),
  )
  .add(
    'Danger',
    withInfo(`
      A danger button.
    `)(() => (
      <Button danger onClick={action('Button Clicked')}>
        Delete Team
      </Button>
    )),
  )
  .add(
    'Caution',
    withInfo(`
      A caution button. e.g. to confirm <Button danger /> actions.
    `)(() => (
      <Button caution onClick={action('Button Clicked')}>
        Click to Confirm Delete
      </Button>
    )),
  );
