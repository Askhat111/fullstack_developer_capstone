import json
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import CarMake, CarModel


class AccountAndInventoryTests(TestCase):
    def test_registration_saves_all_five_fields_and_starts_session(self):
        response = self.client.post(
            reverse("djangoapp:register"),
            data=json.dumps({
                "userName": "askhat-demo", "firstName": "Askhat", "lastName": "R",
                "email": "askhat@example.test", "password": "Strong-pass-2026!",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="askhat-demo")
        self.assertEqual((user.first_name, user.last_name, user.email), ("Askhat", "R", "askhat@example.test"))
        self.assertEqual(int(self.client.session["_auth_user_id"]), user.pk)

    def test_login_and_logout(self):
        User.objects.create_user(username="learner", password="correct-horse-2026")
        login_response = self.client.post(
            reverse("djangoapp:login"),
            data=json.dumps({"userName": "learner", "password": "correct-horse-2026"}),
            content_type="application/json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()["status"], "Authenticated")
        logout_response = self.client.get(reverse("djangoapp:logout"))
        self.assertEqual(logout_response.json()["status"], "Logged out")

    def test_get_cars_serializes_inventory(self):
        make = CarMake.objects.create(name="TestBrandUnique")
        CarModel.objects.create(make=make, name="TestModelUnique", type="SUV", year=2023)
        response = self.client.get(reverse("djangoapp:get_cars"))
        self.assertEqual(response.status_code, 200)
        self.assertIn({"CarMake": "TestBrandUnique", "CarModel": "TestModelUnique"}, response.json()["CarModels"])


class ServiceProxyTests(TestCase):
    @patch("djangoapp.views.get_request")
    def test_dealers_are_returned(self, get_request):
        get_request.return_value = [{"id": 1, "state": "Kansas"}]
        response = self.client.get(reverse("djangoapp:get_dealers"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["dealers"][0]["state"], "Kansas")

    @patch("djangoapp.views.get_request")
    def test_dealer_by_id_is_returned_as_list(self, get_request):
        get_request.return_value = {"id": 3, "full_name": "Sample Dealer"}
        response = self.client.get(reverse("djangoapp:dealer_details", args=[3]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["dealer"][0]["id"], 3)

    @patch("djangoapp.views.analyze_review_sentiments")
    @patch("djangoapp.views.get_request")
    def test_reviews_include_sentiment(self, get_request, analyze):
        get_request.return_value = [{"id": 1, "review": "Fantastic services"}]
        analyze.return_value = {"sentiment": "positive"}
        response = self.client.get(reverse("djangoapp:dealer_reviews", args=[3]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["reviews"][0]["sentiment"], "positive")

    @patch("djangoapp.views.post_review")
    def test_review_submission_uses_authenticated_username(self, post_review):
        user = User.objects.create_user(username="dealer-fan", password="correct-horse-2026")
        self.client.force_login(user)
        post_review.return_value = {"id": 8, "review": "Great"}
        response = self.client.post(
            reverse("djangoapp:add_review"),
            data=json.dumps({"dealership": 1, "review": "Great"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        post_review.assert_called_once()
        self.assertEqual(post_review.call_args.args[0]["name"], "dealer-fan")
