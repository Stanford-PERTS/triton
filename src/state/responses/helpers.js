/**
 * Convenience for switching between two conventions for response parent,
 * either a long cycle uid, or a step-label-based one.
 * @param  {Object} step  from a program config
 * @param  {Object} cycle from the store, optional
 * @param  {Object} team  from the store
 * @return {string}       value to send to the API for response.parent_id
 */
export const responseParentId = (step, cycle) =>
  step.type === 'single' ? step.label : cycle.uid;

/**
 * Converts {key: value} form values to the compound format used on the server,
 * which includes modified timestamps.
 * @param  {Object} formValues     as {key: value}
 * @param  {Object} responseBody   optional, as received from server
 * @return {Object}                as {key: {value, modified}}; if responseBody
 *   is not given, modified times are null.
 */
export const formValuesToBody = (formValues, responseBody) => {
  const body = {};
  for (const key of Object.keys(formValues)) {
    body[key] = { value: formValues[key], modified: null };
    if (responseBody && key in responseBody) {
      body[key].modified = responseBody[key].modified;
    }
  }
  return body;
};

/**
 * Opposite conversion to formValuesToBody; used to extract form value from
 * server data by building a flat map.
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
export const bodyToFormValues = body => {
  const formValues = {};
  for (const key of Object.keys(body)) {
    formValues[key] = body[key].value;
  }
  return formValues;
};
