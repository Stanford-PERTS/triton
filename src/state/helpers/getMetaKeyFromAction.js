import { bareTypeOf } from 'state/helpers';

// Use getMetaKeyFromAction to create keys to store in the redux `meta` store.
const getMetaKeyFromAction = action => {
  const type = bareTypeOf(action);
  const { uid, byId, params } = action;
  const serializedParams = params
    ? JSON.stringify(params, Object.keys(params).sort())
    : undefined;

  return `${type}:${uid || ''}:${byId || ''}:${serializedParams || ''}`;
};

export default getMetaKeyFromAction;
