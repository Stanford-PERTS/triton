import React from 'react';
import { storiesOf } from '@storybook/react';

const Welcome = () => (
  <div>
    <h2>Welcome to the Copilot Storybook.</h2>
    <p>Access component stories via the menu on the left.</p>
  </div>
);

storiesOf('Welcome', module).add('to Storybook', () => <Welcome />);
