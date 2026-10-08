# roommate-resolver-project

Roommate Conflict Resolver

An AI-powered conflict mediation tool for shared living. Roommates log an issue, and the app walks it through a structured intake → mediation → escalation workflow, using Claude to generate neutral, context-appropriate messages at each stage. The goal is to resolve conflicts faster and keep a clear record of what happened.

Status: Fully built end to end and run locally. Not deployed publicly.

What it does
Structured intake. A roommate submits a conflict (what happened, who's involved, what they want). The input is normalized into a case record instead of a loose chat thread.
Three-stage escalation workflow.
Intake – capture the issue and classify it.
Mediation – Claude drafts a neutral, de-escalating message to the other party and suggests a resolution.
Escalation – unresolved cases move up (flagging to an RA). 
Automated messaging. Each stage triggers a message tailored to the case context, so no one has to write the hard conversation from scratch.
Case history. Every case and message is stored, replacing manual tracking of who said what and when.

┌──────────────┐     ┌─────────────────────┐     ┌──────────────┐
│   Client     │ ──▶ │   FastAPI backend   │ ──▶ │  Claude API  │
│ (web form)   │ ◀── │  - case routing     │ ◀── │ (generation) │
└──────────────┘     │  - stage logic      │     └──────────────┘
                     │  - prompt assembly  │
                     └─────────┬───────────┘
                               │
                       ┌───────▼────────┐
                       │   Supabase     │
                       │ (Postgres: cases, │
                       │  messages, users) │
                       └────────────────

                       
FastAPI handles requests, decides which stage a case is in, and builds the prompt for that stage.
Claude API generates the mediation and escalation messages. Each stage has its own prompt; the case's details are passed in as context. No RAG or vector store, since each case carries all the context it needs.
Supabase stores users, cases, stage history, and generated messages.

How I evaluated it
User testing: ~25 people ran real or realistic roommate conflicts through the app. I reviewed the generated messages for tone (neutral, non-accusatory), relevance to the specific situation, and whether the suggested resolution was actionable.
Iteration: Prompts for each stage were revised based on where outputs missed 
Limitations: No automated test suite yet, and evaluation was manual review rather than a scored rubric. Next steps are a small labeled set of test conflicts with a pass/fail rubric for tone and relevance, plus unit tests on the stage-routing logic.
