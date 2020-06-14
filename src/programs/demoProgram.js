import React from 'react';
import Program from 'programs/Program';
import Step from 'programs/Step';
import Task from 'programs/Task';

export const ProgramDocumentsDemo = null;

export default () => (
  <Program>
    <Step type="single" label="introduction" name="Introduction">
      <Task
        type="module"
        title="Demo Single Page Module"
        linkText="Click here to view module."
        label="DemoSinglePageModule"
      />
      <Task
        type="module"
        title="Example Survey"
        linkText="Click here to complete the example survey."
        label="ExampleSurvey"
        showCompletionTracking
      />
    </Step>
    <Step type="cycle">
      <Task
        type="module"
        title="Example Survey"
        linkText="Click here to complete the example survey."
        label="ExampleSurvey"
        showCompletionTracking
      />
    </Step>
  </Program>
);
