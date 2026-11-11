import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
import anthropic

load_dotenv()

app = FastAPI(title="Roommate Resolver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


class ComplaintRequest(BaseModel):
    complaint_text: str


def get_mediation(complaint_text: str) -> dict:
    message = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are a neutral mediator for San Jose State University student housing. "
            "Resolve conflicts by referencing SJSU Student Rights and Responsibilities. "
            "Do not take sides. Use 'I' statements and focus on compromise. "
            "If the complaint involves smoking, drugs, weapons, or severe lease violations, "
            "set severity to 'high', policy_violation to true, and escalate_to_ra to true. "
            "Respond ONLY with a raw JSON object. No markdown, no backticks, no explanation. "
            "Use this exact format:\n"
            '{"severity": "low", "policy_violation": false, "escalate_to_ra": false, '
            '"bot_response": "your message here", "suggested_next_steps": ["step 1", "step 2"]}'
        ),
        messages=[{"role": "user", "content": f"Roommate complaint: {complaint_text}"}],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def verify_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.post("/complaints")
async def submit_complaint(req: ComplaintRequest, authorization: str = Header(None)):
    user_id = verify_token(authorization)
    mediation = get_mediation(req.complaint_text)

    record = {
        "complaint_text": req.complaint_text,
        "severity": mediation["severity"],
        "policy_violation": mediation["policy_violation"],
        "escalate_to_ra": mediation["escalate_to_ra"],
        "bot_response": mediation["bot_response"],
        "user_id": user_id,
    }

    result = supabase.table("conflict_reports").insert(record).execute()
    return {"data": result.data[0], "suggested_next_steps": mediation["suggested_next_steps"]}


@app.get("/complaints")
async def get_complaints(authorization: str = Header(None)):
    verify_token(authorization)
    result = supabase.table("conflict_reports").select("*").order("created_at", desc=True).execute()
    return {"data": result.data}


@app.get("/complaints/escalated")
async def get_escalated(authorization: str = Header(None)):
    verify_token(authorization)
    result = (
        supabase.table("conflict_reports")
        .select("*")
        .eq("escalate_to_ra", True)
        .order("created_at", desc=True)
        .execute()
    )
    return {"data": result.data}
