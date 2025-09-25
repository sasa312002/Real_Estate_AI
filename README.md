# Real Estate AI

An end-to-end web app that analyzes Sri Lankan real estate using AI. Users can log in, submit a property query (city, price, features), and receive an AI-backed analysis with an estimated market value (in LKR), location score, deal verdict, and cited sources. Past analyses are saved to user history for quick review.

## Key Features
- Property analysis with estimated market value (LKR), price-per-sqft, location score, and deal verdict
- Secure authentication (JWT) and protected routes
- User history: browse previously analyzed properties and expand to see full details
- Sources & references: links that explain how the decision was made
- Feedback on AI responses (helpful / not helpful)
- Smart tag suggestions (NEW): while typing a description ("swimming pool", "solar power", "sea view", etc.) the UI suggests semantic tags. Selected tags influence price estimation via amenity/condition premiums or discounts.

## How It Works
- Backend (FastAPI)
  - Sanitizes inputs and stores each query
  - Runs analysis via domain agents:
    - Price agent (heuristics tailored for Sri Lanka + optional Gemini-assisted estimate when API key is provided)
    - Location agent (location score and provenance)
    - Deal agent (Good/Fair/Overpriced + explanation; optional Gemini explanation)
  - Returns a structured response with estimated_price, location_score, deal_verdict, why, confidence, provenance, and currency (LKR)
  - Exposes history and details endpoints to retrieve past analyses
- Frontend (React + Vite + TailwindCSS)
  - Auth flow (login/signup) and protected pages
  - Query form to submit property details
  - Results view with clear verdict and an Analysis card
  - History page with expandable items and sources

## Tech Stack
- Backend: FastAPI, Python 3.11, Pydantic, Async I/O
- Frontend: React 18, Vite, TailwindCSS, Axios, React Router
- Auth: JWT (Bearer)
- Optional AI: Google Gemini (via API key)
- Data: Mongo-style async models (see `app/models/mongodb_models.py`)

## Project Structure
```
real-estate-ai/
  backend/
    app/
      api/            # FastAPI routes (auth, property, feedback)
      agents/         # price/location/deal/security agents
      models/         # models (Mongo-style documents, responses, users)
      core/           # configuration & security
      main.py         # FastAPI app
    requirements.txt  # backend dependencies
  frontend/
    src/              # React app (pages, components, services)
    vite.config.js    # Vite + API proxy (/api -> backend)
```

## Getting Started
### Prerequisites
- Node.js v18+
- Python 3.11+

### Backend (FastAPI)
1. Open a terminal in `real-estate-ai/backend`
2. Create/activate a virtual environment (Windows example):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install deps and run the server:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
4. API docs: `http://127.0.0.1:8000/docs`

Optional: set `GEMINI_API_KEY` in your environment to enable AI-enhanced estimates and explanations.

### Frontend (React)
1. Open another terminal in `real-estate-ai/frontend`
2. Install deps and start dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000/`

Vite proxy forwards `"/api"` to the backend at `http://localhost:8000` (configured in `vite.config.js`). Make sure the backend is running.

## Environment
- Backend reads config from environment variables (see `backend/env.example` if provided)
- Important (optional): `GEMINI_API_KEY` for Google Gemini

## Useful Endpoints (prefix `/api` from the frontend)
- `POST /property/query` — analyze a property
- `GET /property/history` — get current user’s past queries
- `GET /property/details/{query_id}` — get full details for a past query
- `GET /property/suggest_tags?q=TEXT` — lightweight keyword-based tag suggestions
- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`
- `POST /feedback/` — submit feedback for a response
- 

## Notes
- All prices are displayed in LKR. The estimator blends heuristics with AI when available; it does not pull live MLS data by default.
- Tag pricing adjustments are heuristic and additive (e.g., sea view +6%, pool +4%, needs renovation −7%). A provenance entry (`tag_adjustment`) documents the applied net adjustment.
- To avoid committing build artifacts and caches, ensure a `.gitignore` exists at repo root.
## License
MIT (or your preferred license).
