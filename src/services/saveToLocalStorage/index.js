// Example of saving parts of Redux store to localStorage
// https://stackoverflow.com/questions/36580963/can-you-or-should-you-use-localstorage-in-reduxs-initial-state
//
// To use the below, add the following to `src/index.js`:
//   import saveToLocalStorage from './services/saveToLocalStorage';
//   saveToLocalStorage(store);

import selectors from 'state/selectors';

export default store => {
  // Saving the previous sessions user in localStorage causes a problem with
  // Cypress tests because we don't want user data sticking around.
  if (window.Cypress) {
    /* eslint no-console: "off"*/
    console.log(
      'Detected Cypress testing environment. Skipping onbeforeunload handler' +
        'because it conflicts with resetting localStorage.',
    );
    return;
  }

  window.onbeforeunload = event => {
    try {
      const user = JSON.stringify(selectors.auth.neptuneUser(store.getState()));
      localStorage.setItem('triton:auth:user', user);
    } catch (e) {
      console.error(e);
      localStorage.setItem('triton:auth:user', null);
    }
    // May want to debug this function by displaying a prompt before reloading.
    // event.returnValue = "onbeforeunload";
  };
};
