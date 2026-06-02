# Revenue-Based Financing Simulator

PoC #80 for the Real Rails Intelligence Library. This simulator provides a high-fidelity environment for modeling Revenue-Based Financing (RBF) contracts and comparing them against traditional equity dilution.

## 🔷 Intelligence Dashboard

![Desktop Dashboard](screenshots/desktop.png)
*Cinematic Dark Dashboard featuring real-time RBF modeling.*

## 🎥 Demo Video

https://github.com/user-attachments/assets/demo-vid.mp4

https://github.com/anriudh0/POC-80-RevenueBasedFinancingSimulator-Anirudh/blob/main/demo-vid.mp4?raw=true

<video src="https://github.com/anriudh0/POC-80-RevenueBasedFinancingSimulator-Anirudh/blob/main/demo-vid.mp4?raw=true" controls="controls" style="max-width: 100%; height: auto;">
  Your browser does not support the video tag.
</video>

*Watch the simulator in action, featuring real-time data updates and cinematic transitions.*

![Mobile View](screenshots/mobile.png)
*Responsive mobile-first storytelling.*

## 🚀 Key Features

- **Dynamic RBF Modeling:** Adjust investment, revenue share, and repayment caps with real-time feedback.
- **Equity Comparison:** Side-by-side visualization of RBF costs vs. founder ownership loss.
- **Macro Intelligence:** Live benchmark data fetched from **FRED** (Treasury Yields) and **World Bank** (GDP Growth).
- **Deal Signal:** Algorithmic indicator identifying the most capital-efficient path.

## 🛠️ Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion.
- **Backend:** Python 3.14, FastAPI, Pydantic, Scipy-based bisection (IRR).

## 📖 Prerequisites

- **Python 3.14+**
- **Node.js 20+**

---

## 💻 Local Setup & Execution

### 1. Backend Setup
From the root directory:
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
*The API will be live at `http://127.0.0.1:8000`.*

### 2. Frontend Setup
In a **new** terminal window:
```powershell
cd frontend
npm install
npm run dev
```
*The dashboard will be live at `http://127.0.0.1:3000`.*

---

## 🔍 Validation

To verify the engineering integrity of the project:

- **Logic Engine:** `pytest backend/tests`
- **User Flow (E2E):** `cd frontend; npm run test:e2e` (Ensure both servers are running first).

---

## 🧠 Why this matters

RBF is a "Success-Linked" rail. It preserves founder ownership by trading short-term cash flow for long-term equity. This tool turns complex amortization into a stark visual choice for founders and allocators.

*Build for the Intelligence Library.*
