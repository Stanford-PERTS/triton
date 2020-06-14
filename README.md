# Triton

Improvement Challenge Platform - Copilot

## Table of Contents

- [Development](#development)
- [Storybook](#storybook)
- [Coding Guidelines](#coding-guidelines)

## Development

- [Setup](#setup)
- [Snapshot tests](#snapshot-tests)
- [Unit and Integration tests](#unit-and-integration-tests)

### Setup

- See [Tools for Web Development][1] for environment setup steps
- Install [Java](#Java).
- Add `triton` user to MySQL
  - `CREATE USER 'triton'@'localhost' IDENTIFIED BY 'triton';`
  - `GRANT ALL PRIVILEGES ON *.* TO 'triton'@'localhost';`
- Retrieve source code and install
  - `git clone PERTS/triton`
  - `cd triton`
  - `git submodule update --init --recursive`
  - `npm install`
  - `pip install --user mock`
- Start things up
  - MySQL: start MySQL via the System Preference plugin
  - Neptune Server: `npm run server` (from your `neptune` directory)
  - Triton Server: `npm run server` (from your `triton` directory)
  - Triton Webpack Dev Server: `npm start` (from your `triton` directory)
- Run tests
  - `./run_tests.py`
  - `npm test`
- Generate fake development data
  - `npm run faker`
  - Only generates user, team, classroom at the moment
  - Doesn't create user accounts on neptune, so can't login with them

### Java

Part of the App Engine SDK is based on Java (the datastore emulator). Requires version >= 8. This probably works with JRE, which can be manually downloaded and installed, or let homebrew install JDK:

    brew cask install java

### Database Schema Changes (Migrations)

To add a migration:

```
node_modules/.bin/db-migrate  create my-cool-migration --config=database.json --migrations-dir=migrations --env=local --sql-file
```

Then open the new files in `migrations/sqls` and

1. Add SQL code to make the schema change to the "up" file.
2. Add SQL code to _undo_ the schema change to the "down" file.

**Problems with migrations?**

This is often because `db-migration` creates a `migration` table in MySQL that tracks what migrations have and have not been applied. When this gets out sync with the code it can break. Often deleting the table has the desired effect.

### Unit and Integration tests

Some notable test files for patterning new tests:

- /src/state/mockStore.test.js

## Storybook

- Storybook source files are in `src/stories`
- Run [Storybook][2]
  - `npm run storybook`
  - http://localhost:9009
- Build Storybook
  - `npm run build-storybook`
  - Storybook builds to `build/storybook`

[1]: https://docs.google.com/document/d/184dsSF-esWgJ-TS_da3--UkFNb1oIur-r99X-7Xmhfg/edit
[2]: https://github.com/storybooks/storybook

## Coding Guidelines

- [React Coding Guidelines](docs/react.md)

## Npm nonsense

There's a bug in jest where you can't see console logs unless you run it with
`--verbose=false`. Yes, false.

Older versions of enzyme couldn't handle react fragments. When upgrading, ran into [this bug](https://github.com/facebook/create-react-app/issues/6398) which causes `npm test` to report a missing `babel-preset-react-app`. The current version of `react-scripts` requires that @ 7.0.2. Somehow explicitly adding it to package.json @ 7.0.0 fixes the problem. However, now that tests are running again, enzyme still can't process react fragments. 😞
