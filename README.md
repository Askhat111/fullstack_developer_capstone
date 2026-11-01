# fullstack-dealership-capstone

Project: **Dealerships — Full Stack Application Development Capstone**

Responsive dealership directory and review portal built from the IBM Skills Network course starter. The Django application handles accounts, car inventory, pages, and API aggregation. An Express/MongoDB service stores sample dealerships and reviews. A Flask/NLTK microservice classifies review sentiment. The React frontend supports browsing, state filtering, authentication, and review submission.

## Run locally

Requirements: Python 3.12+, Node.js 20+, npm, and Docker Desktop.

1. Start MongoDB and the dealership/review API:

   ```sh
   cd server/database
   docker compose up --build -d
   ```

2. Build the React application:

   ```sh
   cd ../frontend
   npm ci
   npm run build
   ```

3. Start the sentiment service in its own terminal:

   ```sh
   cd ../djangoapp/microservices
   python -m pip install -r requirements.txt
   python -m flask --app app run --host 127.0.0.1 --port 5050
   ```

4. Start Django in another terminal:

   ```sh
   cd ../../
   python -m pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver 127.0.0.1:8000
   ```

   The Django app loads the sample car inventory after migrations. Visit `http://127.0.0.1:8000/`; Django admin is at `/admin/`. Create a normal user through `/register` before posting a review.

## Main routes

- `/` — dealership list and state filter
- `/dealer/<id>` — dealership details and reviews, including sentiment
- `/postreview/<id>` — signed-in user review form
- `/about`, `/contact` — informational pages
- `/djangoapp/login`, `/djangoapp/logout`, `/djangoapp/register` — session authentication
- `/djangoapp/get_dealers`, `/djangoapp/get_dealers/<state>`, `/djangoapp/dealer/<id>`, `/djangoapp/reviews/dealer/<id>`, `/djangoapp/get_cars`, `/djangoapp/add_review` — Django API
- `http://127.0.0.1:3030/fetchDealers`, `/fetchDealers/<state>`, `/fetchDealer/<id>`, `/fetchReviews/dealer/<id>` — Express service
- `http://127.0.0.1:5050/analyze/<url-encoded-review>` — sentiment service

## Submission evidence

The course evaluation asks for screenshots, terminal output, public repository URLs, and a live deployment URL. Those must be captured from a running instance and from the student's own accounts; this README does not claim that the app has been deployed or submitted. All dealership records, team profiles and customer-care contacts are fictional demonstration data, not real businesses or people. The project is based on IBM Skills Network’s `xrwvm-fullstack_developer_capstone` starter; its Apache-2.0 license is retained.
