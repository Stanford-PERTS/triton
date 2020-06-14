import React from 'react';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import pluralize from 'pluralize';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Switch, Route, RouteProps, withRouter } from 'react-router-dom';

import selectors from 'state/selectors';
import { ProgramEntity } from 'services/triton/programs';

/**
 * The TermsContext is designed to wrap the entire app and provide certain
 * customized strings ("terms") based on program configuration. If the program
 * cannot be determined, the value of these terms are all empty strings.
 *
 * To access the program, the provider is wrapped in a route that matches the
 * three types of paths that use programs: /home, /teams, and /organizations.
 * From this it can use path parameters to find the program in the store,
 * determine the terms, and provide them via context.
 *
 * To use (only works in the sections of the app mentioned above, and if the
 * program is loaded into the store):
 *
 *   import React, { useContext } from 'react';
 *   import TermsContext from 'components/TermsContext';
 *
 *   const MyComponent = () => {
 *     const terms = useContext(TermsContext);
 *
 *     return <div>{terms.captain}</div>;
 *   }
 *
 * OR
 *
 *   import React from 'react';
 *   import { withTermsContext } from 'components/TermsContext';
 *
 *   class MyComponent extends React.Component {
 *     render() {
 *       const { terms } = props;
 *
 *       return <div>{terms.captain}</div>;
 *     }
 *   }
 *
 *   export withTermsContext(MyComponent);
 */

export type Terms = {
  [termKey: string]: React.ReactNode,
};

// Prepend the entity term with a/an depending on term. Terms that begin with
// a, e, i, o, u will be prepended with `an`, all others with `a`.
const prependAOrAn = entities => {
  const prependedTerms = {};
  forEach(entities, (entityValue, entityKey) => {
    prependedTerms[entityKey] = ['a', 'e', 'i', 'o', 'u'].includes(
      entityValue.charAt(0).toLowerCase(),
    )
      ? `an ${entityValue}`
      : `a ${entityValue}`;
  });
  return prependedTerms;
};

// With the given entities object, generate a new object that contains the
// pluralized version of each entity. For example, given the following
//   { team: 'Team' }
// this function will return
//   { teams: 'Teams' }
const pluralizeEntities = entities => {
  const pluralizedTerms = {};
  forEach(entities, (entityValue, entityKey) => {
    pluralizedTerms[`${entityKey}s`] = pluralize(entityValue);
  });
  return pluralizedTerms;
};

const getProgramTerms = (program: ProgramEntity | {}): Terms => {
  const label = get(program, 'label', '');

  // Entity names
  const captain = get(program, 'captain_term', '');
  const classroom = get(program, 'classroom_term', '');
  const contact = get(program, 'contact_term', '');
  const member = get(program, 'member_term', '');
  const organization = get(program, 'organization_term', '');
  const team = get(program, 'team_term', '');

  const entities = {
    captain,
    classroom,
    contact,
    member,
    organization,
    team,
  };

  // Phrases
  const addNewTeamDescription =
    label === 'mset19' ? (
      <>
        Choose a name that describes the {team.toLowerCase()} you want to
        improve (e.g., &ldquo;College Alegebra Syllabus&rdquo; or
        &ldquo;Acceptance Letter&rdquo;).
      </>
    ) : (
      <>
        Choose a name that describes your {team.toLowerCase()} (e.g.,
        &ldquo;Jones Calculus&rdquo; or &ldquo;Chemistry Superstars&rdquo;).
      </>
    );

  const phrases = {
    addNewTeamDescription,
  };

  const terms = {
    a: prependAOrAn(entities),
    ...entities,
    ...pluralizeEntities(entities),
    ...phrases,
  };

  return terms;
};

const TermsContext = React.createContext(getProgramTerms({}));

type StateProps = {
  program?: ProgramEntity,
};

const mapStateToProps = (state, props) => ({
  program: selectors.program(state, props),
});

const Provider: React.FC<StateProps & RouteProps> = props => {
  const { program, children } = props;
  return (
    <TermsContext.Provider value={getProgramTerms(program || {})}>
      {children}
    </TermsContext.Provider>
  );
};

const WrappedProvider = compose(
  withRouter,
  connect(mapStateToProps),
)(Provider);

export const RenderWithTermsContext: React.FC = ({ children }) => (
  <Switch>
    {/* routes for which a program is known and terms are applicable */}
    <Route
      path={[
        '/home/:programLabel',
        '/teams/:teamId',
        '/organizations/:organizationId',
      ]}
    >
      <WrappedProvider>{children}</WrappedProvider>
    </Route>
    {/* all other routes, then this component does nothing */}
    <Route>{children}</Route>
  </Switch>
);

export const withTermsContext = BaseComponent => props => (
  <TermsContext.Consumer>
    {terms => <BaseComponent {...props} terms={terms} />}
  </TermsContext.Consumer>
);

export default TermsContext;
