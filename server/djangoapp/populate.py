import json
from pathlib import Path

from django.conf import settings
from django.db import transaction

from .models import CarMake, CarModel


@transaction.atomic
def initiate():
    """Load the course sample inventory into the normalized Django tables."""
    data_file = Path(settings.BASE_DIR) / "database" / "data" / "car_records.json"
    records = json.loads(data_file.read_text(encoding="utf-8")).get("cars", [])
    for row in records:
        make, _ = CarMake.objects.get_or_create(name=row["make"])
        CarModel.objects.get_or_create(
            make=make,
            name=row["model"],
            year=int(row["year"]),
            defaults={"type": row.get("bodyType", "Sedan")},
        )
    return len(records)
