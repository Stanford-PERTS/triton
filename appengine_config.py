import sys
import os.path

# Tell python to look in some extra places for module files for easy importing.

subdirs = [
    ('app',),  # /app, python server code
    ('lib',),  # /lib, python libraries
    ('gae_server',),
    # include subdirectories, e.g. dir1/dir2, like this:
    #('dir1', 'dir2')
]

for path_parts in subdirs:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), *path_parts))
