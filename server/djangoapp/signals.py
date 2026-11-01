from django.db.models.signals import post_migrate
from django.dispatch import receiver


@receiver(post_migrate)
def load_sample_inventory(sender, **kwargs):
    if sender.name != "djangoapp":
        return
    from .populate import initiate

    initiate()
