Backend & Frontend Deployment
=============================

Local development
-----------------

1. Backend (Python / FastAPI)

 - Create virtualenv and install requirements:

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r backend/requirements.txt
```

 - Run the server locally:

```bash
cd backend
uvicorn server:app --reload
```

Environment variables (.env)

 - A `.env` file is auto-created with safe defaults if missing. Required variables to set in production:
   - `MONGO_URL` (MongoDB connection string)
   - `DB_NAME` (database name)
   - `EMERGENT_LLM_KEY` (only required when `emergentintegrations` package is available)
   - `OPENWEATHER_API_KEY` (optional for weather endpoint)

Frontend (Expo)
----------------

 - Install dependencies and start Expo:

```bash
cd frontend
npm install
npm start
```

 - The frontend uses `EXPO_PUBLIC_BACKEND_URL`. If not set, it falls back to `http://127.0.0.1:8000`.

Deployment to Emergent
----------------------

 - Ensure the `emergentintegrations` package is available in the runtime environment. Set `EMERGENT_LLM_KEY` as a secure environment variable in the Emergent dashboard.
 - Set `MONGO_URL` and `DB_NAME` environment variables to point to a production MongoDB instance.
 - Deploy the backend as a Python service with `uvicorn server:app` or using the platform's process manager. The code detects `emergentintegrations` at runtime and uses a dummy fallback when that package is not present (useful for local testing).

Notes
-----

 - The backend will run with an in-memory fallback database when `MONGO_URL` is not provided. This is intended for local development only; production should set `MONGO_URL`.
 - The emergentintegrations dummy returns deterministic JSON so the API always responds with valid JSON.
