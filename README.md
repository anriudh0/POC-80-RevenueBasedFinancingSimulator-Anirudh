# Revenue-Based Financing Simulator

PoC #80 for the Real Rails Intelligence Library.

## What is included

- `backend/`: FastAPI math and data API
- `frontend/`: Next.js dashboard shell and live simulator
- `screenshots/`: Validation screenshots from the latest browser run

## Visuals

- Desktop screenshot: `screenshots/desktop.png`
- Mobile screenshot: `screenshots/mobile.png`
- Demo video: add a hosted link here if you produce one later

## Prerequisites

- Python 3.14
- Node.js 20+ with `npm`

## Run the backend

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://127.0.0.1:3000`.

If port `3000` is already in use, start the production server on another port:

```powershell
cd frontend
npm run build
npm run start -- -p 3001
```

## Validation

- Backend tests: `.\.venv\Scripts\python.exe -m pytest backend/tests`
- Frontend lint: `cd frontend; npm run lint`
- Frontend build: `cd frontend; npm run build`

## Notes

- The frontend expects the backend at `http://127.0.0.1:8000`.
- Live macro data falls back to labeled mock data when the FRED API key is not set or live requests fail.
- The repository includes production screenshots under `screenshots/` for visual verification.
