import has from 'lodash/has';
import isNil from 'lodash/isNil';
import pickBy from 'lodash/pickBy';

/**
 * Returns a new object with key/value pairs defined in defaults param, and
 * values combined from defaults and object params.
 *
 * @param {object} defaults - object of default key/value pairs
 * @param {object} object - object to pick new values from
 * @return {object} new object with key/value pairs defined in defaults and
 *   values combined from defaults and object
 */
const pickFromDefaults = (defaults, object) => ({
  ...defaults,
  ...pickBy(object, (value, key) => !isNil(value) && has(defaults, key)),
});

export default pickFromDefaults;
