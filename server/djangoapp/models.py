from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    class Types(models.TextChoices):
        SEDAN = "Sedan", "Sedan"
        SUV = "SUV", "SUV"
        WAGON = "Wagon", "Wagon"
        COUPE = "Coupe", "Coupe"
        TRUCK = "Truck", "Truck"
        VAN = "Van", "Van"

    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=Types.choices)
    year = models.IntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2023)])

    class Meta:
        unique_together = ("make", "name", "year")

    def __str__(self):
        return f"{self.year} {self.make} {self.name}"
