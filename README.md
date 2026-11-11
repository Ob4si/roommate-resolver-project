# roommate-resolver-project
# Roommate Conflict Resolver

An AI-powered conflict mediation platform that helps roommates work through disagreements before they escalate. Roommates submit an issue, and the app uses the Claude API to guide it through a structured three-stage process, generating neutral, context-appropriate messages at each step.

## Why I built it

My junior year of college my roommates were hell. It was so hard to get resolutions for conflict, even with the amount of connections I had within University Housing Services. Roommate conflicts usually go one of two ways: they get ignored until they blow up, or they turn into tense group-chat arguments. I wanted a neutral middle layer that helps people raise issues early and resolve them fairly, without anyone having to play the bad guy.

## How it works

1. **Intake:** A roommate describes the issue, and Claude turns it into a clear, non-accusatory summary.
2. **Mediation:** The other roommate receives a neutral, context-appropriate message and can respond.
3. **Escalation:** If the issue isn't resolved, it escalates with a suggested next step toward resolution.

Every conflict and response is logged in Supabase, so nothing has to be tracked manually.

## Tech stack

- **Backend:** Python, FastAPI
- **AI:** Claude API (Anthropic)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** JavaScript web app

## Testing and results

I tested the app with about 25 friends, who entered real and hypothetical roommate scenarios. I used their feedback to refine the prompts, so that the generated messages stayed neutral, specific, and appropriate to how serious each issue was.

## Running it locally

**Backend**
```bash
git clone https://github.com/Ob4si/roommate-resolver-project.git
cd roommate-resolver-project
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then add your own API keys
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

You'll need your own Anthropic API key and Supabase project. See `.env.example` for the required variables.

## What's next

- Figma MCP integration for design workflows
- Deploying a hosted version
- Adding automated tests

## About me

Built by Somto Obasi, a student at San José State University interested in tech, data, and everything AI.
[LinkedIn](https://www.linkedin.com/in/somto-obasi-b98b46218/)
