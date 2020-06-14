from gae_handlers import ApiHandler
import mandrill

class MandrillTemplates(ApiHandler):
    requires_auth = True

    def get(self, slug=None):
        """Get a template or list available."""
        if slug:
            results = mandrill.call(
                'templates/info.json',
                {'name': slug}
            )
        else:
            results = mandrill.call(
                'templates/list.json',
                {'label': 'triton'}
            )

        self.write(results)
