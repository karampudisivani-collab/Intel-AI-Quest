import os, sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
DB_PATH = os.getenv("DATABASE_PATH", str(Path(__file__).parent / "intel_ai_quest.db"))
app = FastAPI(title="Intel AI Quest API", version="1.0.0", description="Retail experience prototype API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE,
            persona TEXT NOT NULL,
            score INTEGER NOT NULL,
            answers INTEGER NOT NULL,
            budget_inr INTEGER,
            created_at TEXT NOT NULL
        )""")
init_db()

class SessionIn(BaseModel):
    session_id: str = Field(min_length=3, max_length=80)
    persona: str
    score: int = Field(ge=0, le=300)
    answers: int = Field(ge=0, le=3)
    budget_inr: Optional[int] = None

class GenerateIn(BaseModel):
    mode: str
    text: str = Field(min_length=1, max_length=12000)

class RecommendIn(BaseModel):
    persona: str
    budget_inr: int = Field(ge=10000, le=1000000)

@app.get("/api/health")
def health():
    return {"ok": True, "service": "Intel AI Quest API", "ai_mode": "gemini" if os.getenv("GEMINI_API_KEY") else "fallback"}

@app.post("/api/sessions")
def save_session(payload: SessionIn):
    now = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        conn.execute("""INSERT OR REPLACE INTO sessions
          (session_id, persona, score, answers, budget_inr, created_at)
          VALUES (?, ?, ?, ?, ?, ?)""",
          (payload.session_id, payload.persona, payload.score, payload.answers, payload.budget_inr, now))
    return {"saved": True, "session_id": payload.session_id}

@app.post("/api/ai/generate")
def generate(payload: GenerateIn):
    mode = payload.mode.lower()
    if mode not in {"study", "creator", "work"}:
        return {"output": "Please select Study, Creator or Work mode."}
    key = os.getenv("GEMINI_API_KEY")
    if key:
        try:
            from google import genai
            client = genai.Client(api_key=key)
            prompts = {
                "study": "Summarize the text into clear revision notes, 3 key takeaways and 3 quiz questions. Keep facts grounded in the supplied text.",
                "creator": "Turn the text into a creative brief and 2 social captions. Do not invent factual claims.",
                "work": "Turn the text into an action plan with tasks, owners marked TBD, and suggested next steps. Do not invent deadlines."
            }
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                contents=f"{prompts[mode]}\n\nTEXT:\n{payload.text}"
            )
            return {"output": response.text or "No output returned.", "provider": "gemini"}
        except Exception as exc:
            return {"output": fallback_generate(mode, payload.text), "provider": "fallback", "notice": "AI provider unavailable"}
    return {"output": fallback_generate(mode, payload.text), "provider": "fallback"}

def fallback_generate(mode: str, text: str) -> str:
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
    if mode == "study":
        return "QUICK SUMMARY\n" + ". ".join(sentences[:2]) + ".\n\nKEY TAKEAWAYS\n" + "\n".join(f"{i+1}. {s}" for i,s in enumerate(sentences[:3])) + "\n\nCHECK YOUR UNDERSTANDING\n1. What is the main idea?\n2. Which point needs an example?\n3. What should you verify?"
    if mode == "creator":
        core = sentences[0] if sentences else text[:160]
        return f"CREATIVE DIRECTION\nCore idea: {core}\n\nCAPTION\n“Big ideas start with one small spark. Make it clear, make it useful, make it yours.”\n\nCONTENT TIP\nUse a strong opening, one clear benefit and a call to action."
    return "ACTION PLAN\n" + "\n".join(f"{i+1}. {s} — assign an owner and deadline" for i,s in enumerate(sentences[:5])) + "\n\nNEXT STEP\nConfirm priorities, owners and due dates."

@app.post("/api/recommend")
def recommend(payload: RecommendIn):
    profiles = {
        "student": {"title":"The Study & Build setup","checks":["16 GB RAM or more where budget allows","512 GB SSD or more","Comfortable keyboard and display"],"why":"Prioritize a capable Intel Core Ultra configuration, sufficient RAM and fast SSD storage for IDEs, research, browser tabs and supported AI tools."},
        "creator": {"title":"The Creator setup","checks":["Check GPU and graphics memory","16–32 GB RAM depending on editing","Color-accurate display and fast SSD"],"why":"Prioritize graphics, memory, display quality and the creative applications you actually use."},
        "hustler": {"title":"The Productivity setup","checks":["16 GB RAM or more","Battery capacity and real reviews","Webcam, microphone and display"],"why":"Balance CPU responsiveness, supported AI workloads, video-call features, battery capacity and portability."},
        "gamer": {"title":"The Gaming & Stream setup","checks":["Compare GPU","Cooling and sustained performance","Display refresh rate and RAM"],"why":"Choose based on the exact GPU, cooling, display refresh rate and target games—not the processor name alone."}
    }
    result = profiles.get(payload.persona, profiles["student"])
    return {"recommendation": result, "budget_inr": payload.budget_inr, "note":"Prototype guidance only. Not a live inventory, price or SKU recommendation."}

@app.get("/api/analytics")
def analytics():
    with connect() as conn:
        rows = conn.execute("SELECT persona, score FROM sessions").fetchall()
    total = len(rows)
    personas = {}
    for row in rows:
        personas[row["persona"]] = personas.get(row["persona"], 0) + 1
    avg = round(sum(r["score"] for r in rows) / total, 1) if total else 0
    completed = total  # A saved record is created at the completion screen.
    return {"summary": {
        "sessions": total,
        "completion_rate": round(completed / total * 100) if total else 0,
        "average_score": avg,
        "personas": personas
    }}
