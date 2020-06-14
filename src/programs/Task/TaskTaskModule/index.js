import { compose } from 'recompose';
import { withAllContexts } from 'programs/contexts';

import TaskModule from 'scenes/TaskModule';

export default compose(withAllContexts)(TaskModule);
