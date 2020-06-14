// http://booksyoudontread.com/2016/10/10/mocking-window-localstorage-in-jest/
//
// Some tests require mocking localStorage since localStorage is a browser
// only feature. Add the following to mock:
//
//   import localStorageMock from 'utils/localStorageMock';
//   window.localStorage = localStorageMock;

let localStorage = {};

export default {
  setItem(key, value) {
    return Object.assign(localStorage, { [key]: value });
  },
  getItem(key) {
    return localStorage[key];
  },
  clear() {
    localStorage = {};
  },
};
