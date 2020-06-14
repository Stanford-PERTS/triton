#!/bin/bash

# Commands to be run during a codeship build of the Mindset Kit.
# In a codeship project, in the Setup Commands window, enter this:

# chmod +x codeship_setup.sh && ./codeship_setup.sh

# This ensures that lines which have an error cause this whole script to
# exit with an error.
# http://stackoverflow.com/questions/3474526/stop-on-first-error
set -e

if [ "$CI" = "true" ]; then
  # Codeship checks out the HEAD of the request branch directly, rather than
  # checking out the branch name, which results in a detached HEAD state. This
  # makes other git commands and git-related grunt tasks (e.g. githash) not
  # work nicely. Fix it by explicitly checking out the requested branch.
  git checkout $CI_BRANCH

  # Tell Codeship to cache globally-installed dependencies, so it doesn't take
  # too long to update npm.
  # https://documentation.codeship.com/basic/languages-frameworks/nodejs/#dependency-cache
  npm config set cache "${HOME}/cache/npm/"
  export PATH="${HOME}/cache/npm/bin/:${PATH}"
  export PREFIX="${HOME}/cache/npm/"
fi

# Run a custom python script to compile branch-specific config files.
# Note: neptune uses Cloud SQL, and runs tests
pip install --user mock
pip install --user MySQL-python
pip install --user pycrypto
pip install --user 'ruamel.yaml<0.15'
pip install --user webtest
python gae_server/branch_environment.py

# Codeship [reads the NodeJS version in package.json][1] from the [engine
# setting][2] to set the version of local node. We explicitly set this to 6.9.1
# to avoid a [bug in versions older than 5.6][3] that crops up with webdriver-
# manager.
# [1]: https://documentation.codeship.com/classic/languages-frameworks/nodejs/
# [2]: https://docs.npmjs.com/files/package.json#engines
# [3]: https://github.com/node-inspector/node-inspector/issues/686

# However, Codeship does not automatically keep npm up to date.
# https://documentation.codeship.com/basic/languages-frameworks/nodejs/#dependencies
npm install -g npm@latest

# Install all the node stuff, faster, based on package-lock.json.
# https://blog.npmjs.org/post/171556855892/introducing-npm-ci-for-faster-more-reliable
npm ci --only=production

# Run ESLint
# We perform this before building because there's no point in building if we
# find a linting error.
npm run eslint

# # This executes all the grunt tasks, e.g. minification
npm run build
