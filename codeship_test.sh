#!/bin/bash

# Commands to be run during a codeship build of the Mindset Kit.
# In a codeship project, in the Setup Commands window, enter this:

# chmod +x codeship_test.sh && ./codeship_test.sh

# This ensures that lines which have an error cause this whole script to
# exit with an error.
# http://stackoverflow.com/questions/3474526/stop-on-first-error
set -e

# # Run python unit tests
python run_tests.py

# Run Jest, but only once, without watching for changes.
# On codeship the environment variable CI is set for us, but we want this
# behavior from Jest any time we're running this script, even locally.
CI=true npm run test:CI
