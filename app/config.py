"""Hard-coded python settings.

Note: settings related to environment (production, etc.) should go in the
branch_environments.json file or app.template.yaml file.
"""

# When this is False, the server will accept valid jwts as holy scripture and
# change its own records to make sure that user emails and ids match the token.
# Currently Neptune is our auth server and Triton is not.
is_auth_server = False

# Used in BaseHandler.get_endpoint_str(), part of how we grant permission on
# one platform using the permission rules encoded in another.
platform_name = 'triton'

auth_types = ['email', 'google_id']

session_cookie_name = 'triton_login'


''' SecretValue defaults '''

# Only used when the corresponding SecretValue isn't set.
# Consequently, any use of these keys in production must log an
# error because being hard-coded is inherently insecure.
# See, e.g., mandrill.call().

default_session_cookie_secret_key = ''

default_mandrill_api_key = ''

default_jwt_secret = ''

default_jwt_secret_rsa = '''
'''

default_jwt_public_rsa = '''
'''

''' End SecretValue defaults '''


# Clients from these origins are allowed to make requests from the Triton API.
allow_origins = [
    r'^http://localhost(:\d+)?/?$',
    r'^https://copilot.perts.net/?$',
    r'^https://neptune.perts.net/?$',
    r'^https://(\S+-dot-)?neptuneplatform.appspot.com/?$',
    r'^https://(\S+-dot-)?neptune-dev.appspot.com/?$',
    r'^https://(\S+-dot-)?tritonplatform.appspot.com/?$',
    r'^https://(\S+-dot-)?triton-dev.appspot.com/?$',
    r'^https://www.perts.net/?$',
    r'^https://(\S+-dot-)?yellowstoneplatform.appspot.com/?$',
    r'^https://(\S+-dot-)?yellowstone-dev.appspot.com/?$',
]

# At least 8 characters.
password_pattern = r'^.{8,}$'

# ISO 8601 in UTC for strptime() and strftime()
iso_datetime_format = '%Y-%m-%dT%H:%M:%SZ'
iso_date_format = '%Y-%m-%d'
sql_datetime_format = '%Y-%m-%d %H:%M:%S'

# Email settings
#
to_dev_team_email_addresses = ''
to_program_team_email_addresses = []
# Default FROM address and name
from_server_email_address = ''
from_server_name = ''
# * spam prevention *
# time between emails
# if we exceed this for a given to address, an error will be logged
suggested_delay_between_emails = 10      # 10 minutes
# whitelist
# some addessess we spam
addresses_we_can_spam = []
# Determines if Mandrill sends emails on local or dev environments
should_deliver_smtp_dev = True
