import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import CarMake, CarModel
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)


def _body(request):
    try:
        return json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


@csrf_exempt
@require_POST
def login_user(request):
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Expected a JSON object"}, status=400)
    username = data.get("userName") or data.get("username")
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"error": "userName and password are required"}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"userName": username, "status": "Invalid credentials"}, status=401)
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


@require_GET
def logout_user(request):
    logout(request)
    return JsonResponse({"status": "Logged out"})


@csrf_exempt
@require_POST
def registration(request):
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Expected a JSON object"}, status=400)
    username = data.get("userName") or data.get("username")
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"error": "userName and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=409)
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=(data.get("firstName") or data.get("first_name", "")).strip(),
        last_name=(data.get("lastName") or data.get("last_name", "")).strip(),
        email=(data.get("email") or "").strip(),
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Registered"}, status=201)


@require_GET
def get_dealerships(request):
    try:
        dealers = get_request("fetchDealers")
        return JsonResponse({"status": 200, "dealers": dealers})
    except Exception as exc:
        logger.exception("Unable to fetch dealerships")
        return JsonResponse({"status": 502, "error": "Dealership service unavailable"}, status=502)


@require_GET
def get_dealerships_by_state(request, state):
    try:
        return JsonResponse({"status": 200, "dealers": get_request(f"fetchDealers/{state}")})
    except Exception:
        logger.exception("Unable to fetch dealerships for state %s", state)
        return JsonResponse({"status": 502, "error": "Dealership service unavailable"}, status=502)


@require_GET
def get_dealer_details(request, dealer_id):
    try:
        dealer = get_request(f"fetchDealer/{dealer_id}")
        return JsonResponse({"status": 200, "dealer": [dealer]})
    except Exception:
        logger.exception("Unable to fetch dealership %s", dealer_id)
        return JsonResponse({"status": 502, "error": "Dealership service unavailable"}, status=502)


@require_GET
def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f"fetchReviews/dealer/{dealer_id}")
        for review in reviews:
            try:
                review["sentiment"] = analyze_review_sentiments(review.get("review", "")).get("sentiment", "neutral")
            except Exception:
                logger.warning("Sentiment service unavailable for review %s", review.get("id"))
                review["sentiment"] = "neutral"
        return JsonResponse({"status": 200, "reviews": reviews})
    except Exception:
        logger.exception("Unable to fetch reviews for dealership %s", dealer_id)
        return JsonResponse({"status": 502, "error": "Review service unavailable"}, status=502)


@csrf_exempt
@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    data = _body(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Expected a JSON object"}, status=400)
    data["name"] = request.user.username
    try:
        review = post_review(data)
        return JsonResponse({"status": 200, "review": review})
    except Exception:
        logger.exception("Unable to create review")
        return JsonResponse({"status": 502, "error": "Review service unavailable"}, status=502)


@require_GET
def get_cars(request):
    cars = CarModel.objects.select_related("make").order_by("make__name", "name")
    return JsonResponse({"CarModels": [{"CarMake": car.make.name, "CarModel": car.name} for car in cars]})
