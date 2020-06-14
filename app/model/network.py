"""
Network
===========

Network, one-to-one with its team, with all classroom's students participating,
comprised of growth conditions.
"""
import logging
import string

from model import SqlModel, SqlField as Field
import mysql_connection
import os_random


class InvalidNetworkAssociation(Exception):
    """Provided id(s) are circular, of the wrong kind, or otherwise invalid."""
    pass


class Network(SqlModel):
    table = 'network'

    py_table_definition = {
        'table_name': table,
        'fields': [
            #     name,            type,      length, unsigned, null,  default, on_update
            Field('uid',           'varchar', 50,     None,     False, None,    None),
            Field('short_uid',     'varchar', 50,     None,     False, None,    None),
            Field('created',       'datetime',None,   None,     False, SqlModel.sql_current_timestamp, None),
            Field('modified',      'datetime',None,   None,     False, SqlModel.sql_current_timestamp, SqlModel.sql_current_timestamp),
            Field('name',          'varchar', 200,    None,     False, None,    None),
            Field('program_id',    'varchar', 50,     None,     False, None,    None),
            Field('association_ids','varchar',3500,   None,     False, '[]',    None),
            Field('code',          'varchar', 50,     None,     False, None,    None),
        ],
        'primary_key': ['uid'],
        'indices': [
            {
                'unique': True,
                'name': 'code',
                'fields': ['code'],
            },
        ],
        'engine': 'InnoDB',
        'charset': 'utf8mb4',
        'collate': 'utf8mb4_unicode_ci',
    }

    json_props = ['association_ids']

    @classmethod
    def create(klass, **kwargs):
        if 'code' not in kwargs:
            kwargs['code'] = klass.generate_unique_code()
        # else the code is specified, and if it's a duplicate, MySQL will raise
        # an exception b/c there's a unique index on that field.
        return super(klass, klass).create(**kwargs)

    @classmethod
    def generate_unique_code(klass):
        chars = string.ascii_uppercase + string.digits
        for x in range(5):
            code = ''.join(os_random.choice(chars) for x in range(6))
            matches = klass.get(code=code)
            if len(matches) == 0:
                break
        if len(matches) > 0:
            raise Exception("After five tries, could not generate a unique"
                            "network invitation code.")
        return code

    @classmethod
    def query_by_user(klass, user, program_id=None):
        if len(user.owned_networks) == 0:
            return []

        query = '''
            SELECT *
            FROM `{table}`
            WHERE `uid` IN ({ids}) {program_clause}
            ORDER BY `name`
        '''.format(
            table=klass.table,
            ids=','.join('%s' for uid in user.owned_networks),
            program_clause='AND `program_id` = %s' if program_id else ''
        )
        params = tuple(user.owned_networks +
                       ([program_id] if program_id else []))

        with mysql_connection.connect() as sql:
            row_dicts = sql.select_query(query, params)

        return [klass.row_dict_to_obj(d) for d in row_dicts]

    def before_put(self, init_kwargs, *args, **kwargs):
        # Allow this to raise an exception to prevent bad associations from
        # being saved.
        self.associated_organization_ids(pending_network=self)

        if self.uid in self.association_ids:
            raise InvalidNetworkAssociation(
                "Networks can't reference themselves: {}".format(self.uid)
            )

    def associated_organization_ids(self, depth=0, pending_network=None):
        """Traverse all network-to-network relationships to associated orgs.

        Returns a flat and unique list of org ids.
        """
        # While we support network-to-network, this recursive function could
        # generate many inefficient db calls if we get carried away.
        if depth >= 4:
            raise InvalidNetworkAssociation(
                "Too much depth in network associations: {}"
                .format(self.uid)
            )

        org_ids = set()
        for assc_id in self.association_ids:
            kind = SqlModel.get_kind(assc_id)
            if kind == 'Network':

                # Note! This function is often run as a before_put check that
                # the associations are valid. This means we have to consider
                # the as-of-yet-unsaved "root" network (the `pending_network`)
                # and not any version of it we might fetch from the db in order
                # to catch the introduction of circular references.

                if pending_network and assc_id == pending_network.uid:
                    child_network = pending_network
                else:
                    child_network = Network.get_by_id(assc_id)

                if child_network:
                    child_org_ids = child_network.associated_organization_ids(
                        depth=depth + 1,
                        pending_network=pending_network,
                    )
                    org_ids.update(child_org_ids)
                else:
                    # No exception here because we don't want Networks to
                    # become unusable if an associated thing gets deleted.
                    # @todo: consider having this actually remove the
                    # association ids from the list.
                    logging.warning(
                        "Bad reference in {}: association {} doesn't exist."
                        .format(self.uid, assc_id)
                    )
            elif kind == 'Organization':
                org_ids.add(assc_id)
            else:
                raise InvalidNetworkAssociation(
                    "Invalid association kind: {}".format(kind))

        return org_ids
