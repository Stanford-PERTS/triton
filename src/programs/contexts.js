import React from 'react';
import { compose } from 'recompose';
import forEach from 'lodash/forEach';

const contexts = {
  mono: React.createContext(),
  // The mono Context contains the following data:
  //   program
  //   team
  //   cycles
  //   responses
  cycle: React.createContext(),
  response: React.createContext(),
  step: React.createContext(),
  task: React.createContext(),
  // menu, tasklist, taskmodule, summary, or summaryEmitter
  display: React.createContext(),
};

// Any props provided to RenderChildrenWithContext that appear in the `contexts`
// object above are provided via a React Context Provider to children.
export const RenderChildrenWithContext = ({ children, ...props }) => {
  let WrappedComponent = children;

  forEach(props, (propVal, propKey) => {
    if (contexts[propKey]) {
      const ContextProvider = contexts[propKey].Provider;
      WrappedComponent = (
        <ContextProvider value={propVal}>{WrappedComponent}</ContextProvider>
      );
    }
  });

  // Set the mono Context Provider if all of the mono data is provided
  // All mono Context values must be set at the same time, you cannot only set
  // `program` without `team`, for example.
  if (
    props.program &&
    props.team &&
    props.classrooms &&
    props.cycles &&
    props.responses
  ) {
    const contextValue = {
      program: props.program,
      team: props.team,
      classrooms: props.classrooms,
      cycles: props.cycles,
      responses: props.responses,
    };
    const ContextProvider = contexts.mono.Provider;
    WrappedComponent = (
      <ContextProvider value={contextValue}>{WrappedComponent}</ContextProvider>
    );
  }

  return WrappedComponent;
};

export const withDisplayContext = BaseComponent => props => (
  <contexts.display.Consumer>
    {display => <BaseComponent {...props} display={display} />}
  </contexts.display.Consumer>
);

export const withMonoContext = BaseComponent => props => (
  <contexts.mono.Consumer>
    {mono => <BaseComponent {...props} {...mono} />}
  </contexts.mono.Consumer>
);

export const withCycleContext = BaseComponent => props => (
  <contexts.cycle.Consumer>
    {cycle => <BaseComponent {...props} cycle={cycle} />}
  </contexts.cycle.Consumer>
);

export const withResponseContext = BaseComponent => props => (
  <contexts.response.Consumer>
    {response => <BaseComponent {...props} response={response} />}
  </contexts.response.Consumer>
);

export const withStepContext = BaseComponent => props => (
  <contexts.step.Consumer>
    {step => <BaseComponent {...props} step={step} />}
  </contexts.step.Consumer>
);

export const withTaskContext = BaseComponent => props => (
  <contexts.task.Consumer>
    {task => <BaseComponent {...props} task={task} />}
  </contexts.task.Consumer>
);

export const withAllContexts = BaseComponent =>
  compose(
    withDisplayContext,
    withMonoContext,
    withCycleContext,
    withResponseContext,
    withStepContext,
    withTaskContext,
  )(BaseComponent);
