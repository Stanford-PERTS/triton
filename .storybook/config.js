import { configure } from '@storybook/react';

import './storybook.css';

function loadStories() {
  require('../src/stories');
}

configure(loadStories, module);
