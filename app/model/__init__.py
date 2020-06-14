"""
Model
===========

Contains all Triton data models
"""

import inspect
import sys

from gae_models import (DatastoreModel as Model, Email, format_to_addresses,
                        SecretValue, SqlModel, SqlField, StorageObject,
                        JsonTextValueLengthError,
                        JsonTextDictLengthError, JsonTextLengthError,
                        JSON_TEXT_VALUE_MAX, JSON_TEXT_DICT_MAX,
                        JSON_TEXT_MAX)

from .error_checker import ErrorChecker
from .classroom import Classroom
from .cycle import Cycle
from .digest import Digest
from .metric import Metric
from .network import InvalidNetworkAssociation, Network
from .organization import Organization
from .participant import Participant
from .program import Program
from .notification import Notification
from .report import Report
from .response import (Response, ResponseBodyKeyConflict, ResponseIndexConflict,
                       ResponseNotFound)
from .response_backup import ResponseBackup
from .survey import Survey
from .team import Team
from .user import User, BadPassword, DuplicateUser

__version__ = '1.0.0'


def get_classes():
    """All the class definitions imported here.

    http://stackoverflow.com/questions/1796180/how-can-i-get-a-list-of-all-classes-within-current-module-in-python
    """
    member_tuples = inspect.getmembers(
        sys.modules[__name__], inspect.isclass)
    return [getattr(sys.modules[__name__], t[0]) for t in member_tuples]


def get_datastore_models():
    """Model classes backed by the datastore."""
    # All those classes which are datastore entities (subclass Model) and
    # have entities recorded.
    # Note this excludes classes which use the datastore but don't subclass
    # Model, e.g. SecretValue, which subclasses ndb.Model directly. But this
    # is the behavior we want anyway.
    return [c for c in get_classes()
            if issubclass(c, Model) and c != Model]


def get_sql_models():
    """Classes backed by Cloud SQL."""
    return [c for c in get_classes()
            if issubclass(c, SqlModel) and c != SqlModel]
