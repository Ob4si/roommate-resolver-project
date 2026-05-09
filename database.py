import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
import anthropic

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def get_mediation(complaint_text: str) -> dict:
    print("\n🤖 Mediator is analyzing your complaint...")

    message = claude.messages.create(
        model="claude-sonnet-4-5",
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
        messages=[
            {"role": "user", "content": f"Roommate complaint: {complaint_text}"}
        ]
    )

    raw = message.content[0].text.strip()
    # Strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    
    result = json.loads(raw.strip())
    return result

def add_complaint():
    print("\n[ Submit a Complaint ]")
    user_complaint = input("What did your roommate do?\n> ")

    mediation = get_mediation(user_complaint)

    print(f"\n🧠 Mediator Response:\n{mediation['bot_response']}")
    print(f"\n📋 Severity: {mediation['severity'].upper()}")
    if mediation['escalate_to_ra']:
        print("⚠️  This will be flagged for RA review.")
    print("\n✅ Next Steps:")
    for step in mediation['suggested_next_steps']:
        print(f"  - {step}")

    new_conflict = {
        "complaint_text": user_complaint,
        "severity": mediation["severity"],
        "policy_violation": mediation["policy_violation"],
        "escalate_to_ra": mediation["escalate_to_ra"],
        "bot_response": mediation["bot_response"]
    }

    supabase.table("conflict_reports").insert(new_conflict).execute()
    print("\n✅ Complaint and mediation logged to database.")

def view_complaints():
    print("\n[ Recent Complaints ]")
    response = supabase.table("conflict_reports").select("*").limit(5).execute()

    for report in response.data:
        print(f"\nSeverity: {report['severity'].upper()}")
        print(f"Complaint: {report['complaint_text']}")
        print(f"Bot Response: {report['bot_response']}")
        if report['escalate_to_ra']:
            print("⚠️  Flagged for RA")
        print("---")

def main_menu():
    while True:
        print("\n=== Roommate Conflict Reporter ===")
        print("1. Submit a New Complaint")
        print("2. View Existing Complaints")
        print("3. Exit")

        choice = input("Select an option (1-3): ")

        if choice == '1':
            add_complaint()
        elif choice == '2':
            view_complaints()
        elif choice == '3':
            print("Exiting system.")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main_menu()
