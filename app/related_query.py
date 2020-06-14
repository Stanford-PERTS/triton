from gae_handlers import RestHandler
from model import Classroom
from permission import owns


def RelatedQuery(model, relationship_property):
    """Generates handlers for relationship-based queries."""

    allow = 'GET, HEAD'

    class RelatedQueryHandler(RestHandler):
        """Dynamically generated handler for listing a resource by their
        relationship to another."""
        requires_auth = True

        def get(self, parent_type, rel_id):
            # You must be a super admin or own the related object.
            user = self.get_current_user()
            rel_id = self.get_long_uid(parent_type, rel_id)

            if not rel_id:
                return self.http_not_found()

            if not owns(user, rel_id):
                return self.http_forbidden()

            # Simulate a query string parameter so existing handler code
            # can run the query.
            self.request.GET[relationship_property] = rel_id

            # Of all the kinds we can query with RelatedQuery (Classroom,
            # Surveys, Reports) only clasrooms have a name for ordering.
            ordered_types = (Classroom,)
            if model in ordered_types and 'order' not in self.request.GET:
                self.request.GET['order'] = 'name'

            # There is no id-based GET for these RelatedQuery endpoints,
            # e.g. we don't support /api/projects/X/users/Y.
            # Skip right to the inherited query() method.
            return super(RelatedQueryHandler, self).query(
                override_permissions=True)

        def post(self):
            return self.http_method_not_allowed(self.allow)

        def put(self):
            return self.http_method_not_allowed(self.allow)

        def delete(self):
            return self.http_method_not_allowed(self.allow)

    RelatedQueryHandler.model = model
    RelatedQueryHandler.__name__ = '{}s by {}'.format(
        model.__name__, relationship_property)

    return RelatedQueryHandler
