from django.apps import AppConfig


class DjangoappConfig(AppConfig):
    name = 'djangoapp'

    def ready(self):
        from . import signals  # noqa: F401
