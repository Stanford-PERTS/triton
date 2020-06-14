# React Coding Guidelines

## Table of Contents

- [React](#react)
- [Redux](#redux)
- [Styled Components](#styled-components)
- [Ideas](#ideas)

## React

React is our framework of choice for making and developing reusable UI
components.

- [UI Components](#ui-components)
- [Scenes](#scenes)
- [Testing Components](#testing-components)
- [PropTypes](#proptypes)

### UI Components
  Simple, functional, reusable, 'dumb' components that can be used throughout
  the app.

  Components at the top-level of this directory should be global components and
  therefore able to be imported anywhere within the application. Nested components
  are there to support their parent components and should not be imported anywhere
  in the app besides by their parent.

  ```
  - components
    - Card (global, can import anywhere else)
      - CardSelect (nested, only import in Card)
      - CardTitle (nested, only import in Card)
  ```
#### Why?

- Clear which components can be used.
- Changes can be made to nested components without breaking the app.
- Easier to determine if a component can be removed (orphaned code) -- does the
  parent import it? No? Then it can be removed.

#### Did I do it right?

Can you copy the top-level component (`Card` and subdirectories) from this React
project to another and have it work without any changes? If so, then you probably did.

### Scenes
  Complex, class, nonreusable, 'smart' (e.g. connects to redux store)
  components that handles the logic for a collection of components. These scenes
  represent a route in our application. 
    - Scenes also have subcomponents - these components are generally not
        reusable, and are mostly 'dumb' (not always).

  Just like components within `components`, these should follow the "only
  top-level is global" principle.


### Testing Components

- [Enzyme][9] for testing react components.
- [react-fake-props][10] for generating mock prop values from component
    prop-types
- Give components prop `data-test` with some identifying string to be used with
    enzyme to select the component during testing (e.g. a form field for
    inputing user name could be given a data-test prop with value `name`.
    - Use testSelector util imported from 'utils/testingUtils' to create a
        data-test selector string
- Separate scenes into component and container, e.g. a Team scene 
    would be split into a TeamComponent which is only concerned with rendering
    the scenes components from a given set of props, and a TeamContainer (higher
    order component) would connect TeamComponent to the store, make into a
    redux-form, etc.
- Use enzyme's shallow function to test the component part
- Use enzyme's mount function to test the container part
    - NOTE: you'll need to mock our app environment in order to test containers,
        i.e. wrap in Provider, MemoryRouter, etc.
- See ClassroomDetails scene as an example.

### PropTypes

We need to be including [PropTypes][11] for all our components.
  - Makes testing easier.
  - Catches bugs.

NOTE: we may want to start creating our own resusable PropTypes, e.g.
    objectOf(object), objectOf(arrayOf(object)), etc.

## Redux

- [State](#state)
- [Selectors](#selectors)
- [Sagas](#sagas)

### State

Server data split into their own state slice from the server. e.g. classrooms,
teams, etc.

ReduxForm has it's own `form` slice for handling it's own state for each the
forms.
  - Separate state slice for each form for handling our own form related state.
  - See team form for example.

Shared slice for actions/sagas that access multiple parts of the app's state.
e.g. removing a user from a team involves updating the user and the team.


### Selectors

- [Why Selectors?](#why-selectors)
- [Selector Guidelines](#selector-guidelines)
- [Selector Anatomy](#selector-anatomy)
- [Use selectors to manipulate state data](#use-selectors-to-manipulate-state-data)
- [Decouple selectors from app state](#decouple-selectors-from-app-state)
- [Selector Organization](#selector-organization)
- [Root Selectors File](#root-selectors-file)
- [Calling Selectors](#calling-selectors)
- [Naming Selectors](#naming-selectors)

#### Why Selectors?
  
- [Reselect][1]
- Selectors can compute derived data, allowing Redux to store the minimal possible state.
- Selectors are efficient. A selector is not recomputed unless one of its arguments change.
- Selectors are composable. They can be used as input to other selectors.

#### Selector Guidelines

- Components should only use selectors to access the Redux store.
- Components should only `import selectors from 'state/selectors'`, instead of
  accessing slice-specific selector files.
- Utilize selectors to manipulate (sorting, filtering, etc.) data for viewing
  instead of performing these data manipulations in React components or Redux reducers.
- Selectors are created using reselect's [createSelector][2] function.

#### Selector Anatomy

Function that takes in a `state` object, and an optional `props` object
```
getClassroom = (state, props) => state.classroomsById(props.classroomId)
```
The above selector would be an antipattern, however, because the selector is
selecting multiple parts of the app's frame - i.e. if you think of the
application as a function (render) that has two parameters - state and props -, then
it would render it's current frame from these two arguments. It is better to
have reusable selectors that deal with only one argument to the render function,
because it results in cleaner and more maintainable code.

So, the above selector splits into two selectors:
```
classroomsById = (state, _) => state.classroomsById
classroomId = (_, props) => state.classroomId
```
Notice, however, that we still expect each selector to receive state and props
as arguments, but each selector in this case is only concerned with one of them.

Formatting our selectors in this manner allows us to easily combine selectors
into new selectors that can manipulate the state in other ways - using
reselect's [createSelector][2].
```
getClassroom = createSelector(
  classroomsById,
  classroomId,
  (csById, cId) => csById[cId],
);
```

#### Use Selectors to manipulate state data

If when writing a component you notice you are manipulating data pulled from the
state directly in the component file, then it is best that you pull this logic
into a new reusable selector that performs the manipulation for you. This helps
us in two clear ways:
- Cleans up the syntax of our React components
- Centralizes the logic to one location for easy maintenance.

It also helps reduce computations, because createSelector [memoizes][3] the
results.

#### Decouple selectors from app state

[Source][4]

Selectors are best written in a modular sense, where they are only concerned
with the way their local reducer organizes its state, e.g.
```
fooReducer = (state, action) => {
  switch (action.type) {
    case SET_FOO:
      return {
        ...state,
        foo: action.foo
      };
    default:
      return state;
  }
}

getFoo = state => state.foo
```

> The main advantage to this approach is that we may easily pull this foo module
  out of this app and drop it into another app easily without much, if any,
  modification.

If we have an app state that uses this reducer, then we need to nest the `foo` state
into its own slice.
```
appState = combineReducers({
  foo: fooReducer
  ...other slices
});
```

Now, however, we need a way to use the foo selectors without having to pass the
foo slice directly - i.e. `getFoo(state.foo)`.

To avoid this, we use our util function `createSeletors` - which uses reselect's
[createSelector][2] internally - to point our modular selectors to their slice
of the app's state.

```
import createSelectors from 'utils/createSelectors'
import * as foo from 'state/foo/selectors'
// Selector for foo slice of app state
getFooData = state => state.foo

fooSelectors = createSelectors(getFooData, foo);
```

#### Selector Organization

[Source][5]


```
- state/
    - auth/
    - classrooms/
    - digests/
    - form/ // redux-forms
    - metrics/
    - reports/
    - routing/ // routing related
        - selectors.js // currently `lib/reactRouter`
    - surveys/
    - teams/
        - selectors.js // teams slice selectors
    - uploads/
    - users/
    - selectors.js // root selectors file
```

So:

- `state/selectors.js` export **cross-slice** selectors
- `state/selectors.js` import/export **slice-specific** selectors
- `state/teams/selectors.js` contain `teams` specific selectors
- `state/${slice}/selectors.js` contain `${slice}` specific selectors

#### Root Selectors File

```
// Example state/selectors.js file

import { createSelector } from 'reselect';
import createSelectors from 'utils/createSelectors';

// Routing Selectors
import routingSelectors from './routing/selectors';
// Example route selector
// routeClassroomId = (_, props) => fromParams(props).classroomId
// fromParams pulls the nested params object, provided by react-router-dom, from
// the props object

// Slice Specific Selectors
import classrooms from './classrooms/selectors';

// Slice Selectors
const classroomsData = state => state.classroomsData;

// Bind slice specific selectors to their slice of the app state
const classroomsSelectors = createSelectors(classroomsData, classrooms);


// Cross-Slice Selectors
// These are selectors that require more than one slice of data. You can tell
// that a selector is probably a cross-slice selector by the fact that is
// uses data from more than one selectors file. Example: `classroomsSelectors`
// and `routingSelectors`.

// For example, getting all of the classrooms for a team from route:
const getTeamClassrooms = createSelector(
  classroomSelectors.getClassroomsByTeamId,
  routingSelectors.routeTeamId,
  (classrooms, teamId) => classrooms[teamId]
);

// Where `classroomsSelectors.allClassroomsGroupedByTeamId` is returning an
// object structured like:
// 
//   {
//     'Team_001': [ { ...classProps }, { ...classProps }, { ...classProps } ],
//     'Team_002': [ { ...classProps }, { ...classProps }, { ...classProps } ],
//     'Team_003': [ { ...classProps }, { ...classProps }, { ...classProps } ],
//   }
//
// And `routingSelectors.teamId` is returning a string like:
//
//   'Team_002'

// A couple more cross-slice examples

// Get Classroom, based on route
const getClassroom = createSelector(
  classroomsSelectors.classroomsById,
  routingSelectors.routeClassroomId,
  (classrooms, classroomId) => classrooms[classroomId]
);

// Finally, export all root selectors and slice selectors on the same object:
export default {
  ...classroomsSelectors,
  // ...otherSliceSelectors,

  // Cross slice selectors
  getTeamClassrooms,
  getClassroom,
  // ...otherCrossSliceSelectors,
};
```

#### Calling Selectors

The above allows us to retrieve all data from the Redux store using selectors with the following pattern:

```
import selectors from 'state/selectors';

function mapStateToProps(state, props) {
  return {
    ...,
    classrooms: selectors.getTeamClassrooms(state, props),
    team: selectors.getTeam(state, props),
    ...,
  };
}
```

#### Naming Selectors

Since we'll have a lot of selectors, some guidelines for naming selectors to help
maintain consistency and make it easier to remember what they do.

`routingSelectors`

- `routeTeamId` pulls `:teamId` off the route
- `routeClassroomId` pulls `:classroomId` off the route
- `routeUserId` pulls `:userId` off the route

`classroomsSelectors`

- Base functions, as data is stored in Redux:
    - `classroomsById` returns classrooms object as stored in Redux, indexed by uid
    - `classroomsError`
    - `classroomsLoading`
    - `classroomsMode`
- Composed functions (notice the use of the prefix 'get'):
    - `getClassrooms` array of all classrooms
    - `getClassroomsIds` array of all classroom uids
    - `getClassroomsNames` array of all classroom names
    - `getClassroomsByTeamId` arrays of all classrooms, grouped/indexed by team uid

If we need to create grouped/indexed objects, then indicate what we're grouping
by with appending a `By{ThingId}` to the name.

`root/selectors`

- `getClassroom` single team
- `getTeam` single team
- `getTeamClassrooms` array of team's classrooms
- `getTeamClassroomsNames` array of team's classrooms' names
- `getUserClassrooms` array of user's classrooms
- `getUserClassroomsNames` array of user's classrooms' names

The first part `get{Thing}` is the part indicating what we're pulling off the
route params, the second part is the data we want that belongs to it.

### Sagas

- [When should we use sagas?](#when-should-we-use-sagas)
- [Testing Sagas](#testing-sagas)

#### When should we use sagas?

[Source][6]

Sagas are always used whenever we have actions that involve side effects
(i.e. asynchronous actions like data fetching), but we aren't limited to using
them for just async actions.

Sagas provide a clean way to sequence up redux actions, so we should use
whenever possible:

- Cleans up the code base in components
- Creates a reusable action
- Easy to test

#### Testing Sagas

We have landed on using [redux-saga-test-plan][7] to test our sagas. It provides
a flexible means of testing redux sagas, so that we may test what's important
for each saga. See [example][8].

For example, test that a saga that updates a classroom calls our api, and
updates our store. NOTE: the latter would require testing with the reducer as
well. See 'state/classrooms/sagaWithReducer.test.js' for an example.

We should avoid testing sagas in the old unit way, where we test exact effects
and their ordering, because a) it makes for brittle tests, and b) it's time
consuming to write and read. 

#### Writing Sagas

- Sagas should be simple and easy to read/understand
- If we notice sagas are getting long and complicated, then split them up into
    multiple sagas.

## Styled Components

Inline style should be avoided, instead we are transitioning to using
[styled-components][12] for all our styling needs.

NOTE: We should also look into using [emotion][13] for creating these styled
components, which may have better performance.

## Ideas

- Using [flow][14] for static type checking for use in development.
  - Can be gradually integrated into our project.
  - Catches bugs during compile time that are hard to debug during runtime

- Making better use of higher-order-components(HOCs).
  - [Recompose][15] provides a lot of useful HOCs that we should look more into.
  - [react-fns][16] also looks promising for handling common browser situations.
      e.g. GeoPosition, MediaQueries, etc.

- Internationalization with [react-i18next][17] and [locize][18].

- Make our web app into a mobile app with [React Native][19].

- Benchmarking with [react and chrome][20].

- Documentation with [react-docgen][21].

[1]: https://github.com/reactjs/reselect

[2]: https://github.com/reactjs/reselect#createselectorinputselectors--inputselectors-resultfunc

[3]: http://redux.js.org/docs/recipes/ComputingDerivedData.html

[4]: http://brianyang.com/scoped-selectors-for-redux-modules/

[5]: https://github.com/PERTS/triton/pull/409#discussion_r147429092

[6]: https://github.com/redux-saga/redux-saga

[7]: https://github.com/jfairbank/redux-saga-test-plan

[8]: https://github.com/PERTS/triton/pull/454/files#diff-f5a397f9a092fd564cd3562da8eeeac1

[9]: https://github.com/airbnb/enzyme

[10]: https://github.com/typicode/react-fake-props

[11]: https://github.com/facebook/prop-types

[12]: https://github.com/styled-components/styled-components

[13]: https://github.com/emotion-js/emotion

[14]: https://flow.org/en/

[15]: https://github.com/acdlite/recompose

[16]: https://github.com/jaredpalmer/react-fns#devicemotion

[17]: https://github.com/i18next/react-i18next

[18]: https://locize.com/

[19]: https://facebook.github.io/react-native/

[20]: https://reactjs.org/docs/optimizing-performance.html#profiling-components-with-the-chrome-performance-tab

[21]: https://github.com/reactjs/react-docgen

