"""
ResponseBackup
===========

Per-write copies of response rows, just for backup, not for use in the app.

Note: `uid` here is NOT unique.

Note: schema must be kept in sync with the response table

While entries in `response` mutate as people answer more questions or return to
their response and change it, entries in `response_backup` are immutable. A new
one is written with every change. So it gives us a history.
"""
from google.appengine.api import taskqueue
import copy
import datetime
import json
import logging

from model import SqlModel
import mysql_connection
import util


class ResponseBackup(SqlModel):
    table = 'response_backup'

    # Translating a py def here doesn't allow AUTO_INCREMENT. We don't really
    # need these anyway. See get_table_definition().
    py_table_definition = {'fields': []}

    json_props = ['body']

    @classmethod
    def get_table_definition(klass):
        """We don't need to introspect fields/params, so just hard-code."""
        return '''
            CREATE TABLE `response_backup` (
              `backup_id` int unsigned NOT NULL AUTO_INCREMENT,
              `uid` varchar(50) NOT NULL,
              `short_uid` varchar(50) NOT NULL,
              `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
              `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              `type` varchar(20) NOT NULL,
              `private` bool NOT NULL DEFAULT 1,
              `user_id` varchar(50) NOT NULL,
              `team_id` varchar(50) NOT NULL,
              `parent_id` varchar(50) DEFAULT NULL,
              `module_label` varchar(50) NOT NULL,
              `progress` tinyint(4) unsigned NOT NULL DEFAULT 0,
              `page` tinyint(4) unsigned DEFAULT NULL,
              `body` text,
              PRIMARY KEY (`backup_id`),
              INDEX `uid` (`uid`)
            )
            ENGINE=InnoDB DEFAULT CHARSET=utf8;
        '''
