# INTEL AI QUEST — Competition Project

**Tagline:** The Future Is You  
**Challenge:** Intel 1 Million Minds — Round 1 retail AI PC experience  
**Format:** React web app + optional FastAPI/Gemini backend

## What is included
- Touchscreen-friendly retail landing page
- Four shopper personas: Student, Creator, Hustler, Gamer
- Three timed-feel scenario challenges with scoring and feedback
- Personalized result and usage-based buying checklist
- AI Studio with Study, Creator and Work modes
- Optional Gemini API integration with deterministic fallback
- AI PC explainer: CPU, GPU and NPU
- Retail insights dashboard backed by SQLite
- Downloadable and copyable result summary
- Seven-day competition execution plan in `docs/SUBMISSION_PLAN.md`
- Pitch narrative and judge demo script in `docs/PITCH_AND_DEMO.md`

## Prerequisites
- Node.js 20+ and npm
- Python 3.10+
- Optional Gemini API key for cloud-generated AI Studio output
- A laptop with a modern browser. Touchscreen is recommended but not required.

## Run the frontend
```bash
npm install
cp .env.example .env
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

## Run the backend (optional but recommended)
Open a second terminal:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
```
Add your Gemini key to `backend/.env` if you want cloud generation. Then:
```bash
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

The frontend works without the backend. When the backend is offline, AI Studio uses a deterministic local demo fallback and analytics are not persisted.

## Project structure
```text
Intel_AI_Quest_Competition/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api.js
│   └── styles.css
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── docs/
    ├── SUBMISSION_PLAN.md
    └── PITCH_AND_DEMO.md
```

## Honest AI / hardware demonstration
The AI Studio uses Gemini through a cloud API if configured. Its offline fallback is deterministic text formatting, not a language model. Neither should be described as using the Intel NPU.

For the hardware proof point, connect a compatible Intel Core Ultra AI PC and demonstrate an application/feature that is verified to run on that device. Capture the exact laptop model, processor, NPU capability, app version and whether the feature is local or cloud-assisted. Feature support varies by device, software, region and settings.

## Privacy and retail use
- Do not collect names, phone numbers, email addresses or sensitive content.
- The prototype stores session ID, selected persona, score, answer count, budget band and timestamp only.
- Use anonymous aggregate analytics.
- Do not present recommendations as exact SKUs or current prices until a retailer product catalogue is integrated and verified.

## Before judging
1. Test `npm run build`.
2. Start backend and frontend; confirm API connected.
3. Complete all four personas and all result flows.
4. Test the app at 1366×768 and a mobile viewport.
5. Test offline mode by stopping the backend.
6. Rehearse the 2–3 minute demo and keep one tested laptop ready.
