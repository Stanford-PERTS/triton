import 'polyfills/Array.every';
import 'polyfills/Array.filter';
import 'polyfills/Array.find';
import 'polyfills/Array.findIndex';
import 'polyfills/Array.forEach';
import 'polyfills/Array.includes';
import 'polyfills/Array.indexOf';
import 'polyfills/Array.reduce';
import 'polyfills/Array.some';
import 'polyfills/Object.assign';
import 'polyfills/Object.create';
import 'polyfills/Object.keys';
import 'polyfills/Object.values';
import 'polyfills/String.includes';
import 'polyfills/String.startsWith';
import 'polyfills/String.trim';
import 'polyfills/Promise';
import 'polyfills/Set';

// Override the browser built-in fetch with the unfetch polyfill that utilizes
// XHR. This is needed so that our Cypress test api route stubbing will work.
// https://github.com/cypress-io/cypress/issues/920
// https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/stubbing-spying__window-fetch/cypress/integration/polyfill-fetch-from-tests-spec.js
// https://github.com/developit/unfetch
delete window.fetch;
require('unfetch/polyfill');
