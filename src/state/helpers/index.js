export { default as defaultInitialState } from './defaultInitialState';

export { default as addActionTypeToAction } from './addActionTypeToAction';
export { default as makeAction } from './makeAction';
export { default as getMetaKeyFromAction } from './getMetaKeyFromAction';
export { default as fullTypeOfAction } from './fullTypeOfAction';
export { default as bareTypeOf } from './bareTypeOf';
export { default as requestTypeOf } from './requestTypeOf';
export { default as successTypeOf } from './successTypeOf';
export { default as failureTypeOf } from './failureTypeOf';

export { default as entitiesReducer } from './entitiesReducer';

export { default as generateSagaFunctions } from './generateSagaFunctions';

// Existing redux helper functions
// TODO will probably be replaced by entitiesReducer
export { default as reducerById } from './reducerById';
// TODO will probably be replaced by meta reducers (loading, errors)
export { default as reducerError } from './reducerError';
export { default as reducerLoading } from './reducerLoading';
export { default as reducerUpdating } from './reducerUpdating';

export { default as reducerRedirect } from './reducerRedirect';
