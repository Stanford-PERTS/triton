"""
Digest
===========

Text-only message for users to read, which summarizes one day of notifications
of a certain type.
"""
import datetime
import jinja2
import logging

from model import SqlModel, SqlField as Field, Email
from .notification import Notification
import mysql_connection

import util


# This is for taking already-rendered and already-escaped item bodies and
# inserting them into a digest body. Don't escape html, and signify this
# unusual behavior with different brackets.
jinja_items = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
    autoescape=False,
    variable_start_string='((',
    variable_end_string='))',
)


jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True,
)


class Digest(SqlModel):
    table = 'digest'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('user_id',       'varchar', 50,     None,     False, None,    None),
            # 'generic', 'survey', or 'report' as of 2017-07-26
            Field('type',          'varchar', 50,     None,     False, None,    None),
            # Fully-rendered HTML with a <div> as root element.
            # N.B. text fields aren't searchable.
            Field('body',          'text',    None,   None,     False, None,    None),
            Field('read',          'bool',    None,   None,     False, 0,       None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'name': 'user',
                'fields': ['user_id'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8',
    }

    @property
    def subject(self):
        return {
            'generic': ("You have notifications on Copilot."),
            'survey': (u"It\x27s time to survey your students for Copilot!"),
            'report': ("You have new reports in Copilot!"),
            'main-contact': ("The main contact for your class has been "
                             "updated."),
        }[self.type]


    @classmethod
    def create(klass, notifications):
        if len({n.type for n in notifications}) > 1:
            raise Exception("Mixed types: {}".format(notifications))
        if len({n.user_id for n in notifications}) > 1:
            raise Exception("Mixed users: {}".format(notifications))
        prototype_note = notifications[0]

        digest = super(klass, klass).create(
            user_id=prototype_note.user_id,
            type=prototype_note.type,
            body='',  # not finished yet, but we'll use the instance to render
        )

        # Three rendering steps:
        # 1. Interpolating data in each notification via `n.render()` which
        #    becomes an "item". Data varies by notification.
        # 2. Inserting all rendered items (html) in a digest body, which does
        #    not use escaping, leaving any potential data interpolation in the
        #    digest body alone (different bracket syntax).
        # 3. Interpolating data in the digest body, assuming that the prototype
        #    notification has the necessary values.
        items = ''.join(n.render() for n in notifications)
        body_with_items = (
            jinja_items
            .get_template(digest.get_template_path())
            .render(items=items)
        )
        digest.body = (
            jinja_env
            .from_string(body_with_items)
            .render(**prototype_note.template_params)
        )

        return digest

    def get_template_path(self):
        return 'notifications/digest_body_{}.html'.format(self.type)

    @classmethod
    def process_user(klass, user, start, end):
        """Query, digest, save, and send messages to a user."""

        # Render separate notifications into digests, grouping by type.
        user_notes = Notification.get_period_for_user(user, start, end)
        digests = [Digest.create(notes)
                   for notes in util.list_by(user_notes, 'type').values()]

        # Send messages to users about their new digests, based on preferences.
        emails = []
        smss = []
        for d in digests:
            if user.receive_email:
                emails.append(d.get_email(user.email))
            if user.receive_sms:
                # @todo: install Twilio, create a sending queue
                # smss.append(d.get_sms(user.phone_number))
                pass

        return digests, emails, smss

    def get_email(self, to_address):
        template = jinja_env.get_template('notifications/digest_email.html')
        return Email.create(
            to_address=to_address,
            subject=self.subject,
            html=template.render(body=self.body)
        )

    def to_client_dict(self):
        return dict(super(Digest, self).to_client_dict(), subject=self.subject)
