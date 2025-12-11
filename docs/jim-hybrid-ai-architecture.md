HYBRID AI ARCHITECTURE (JIM'S REQUIREMENTS - SUMMARY)
=====================================================

Key point
---------
We must use THREE distinct but integrated intelligence layers:

1) Conversational Brain: General purpose LLM (Claude) with RAG
   - For conversational coaching, motivation, habit building, emotional support and explanations.

2) Personalization Brain: Deterministic, rules based movement engine
   - For exercise selection, progressions, regressions and any safety sensitive recommendation.

3) Safety Brain: Guardrail override layer
   - Sits above both Conversational Brain and Personalization Brain.
   - Enforces safety guardrails, detects red-flag symptoms, overrides unsafe outputs.
   - Ensures compliance with clinical safety constraints.
   - Uses deterministic rules (no LLM, no RAG).

Why LLM alone is not enough
---------------------------
- Hallucination risk (invented exercises, unsafe progressions).
- Lack of biomechanical reasoning (joint loading, balance, strain).
- Inconsistent outputs (same question, different answers).
- Regulatory and liability requirements (need deterministic, auditable logic).

Where LLM is appropriate
------------------------
- Emotional coaching and encouragement.
- Explaining why movements matter and how they connect to goals.
- Behavior change and identity work.
- Interpreting user goals and fears in natural language.
- Answering general health/wellness questions from curated content (no diagnosis).

Movement engine requirements
----------------------------
- Uses structured data models:
  - movement id, equipment, difficulty, functional category,
    contraindications, allowed regressions/progressions, muscles, joint stress, time, prerequisites.
- Uses rules such as:
  - knee pain -> exclude deep knee flexion in closed chain.
  - failed balance assessment -> static before dynamic.
  - reports pain -> apply regression rules.
- Deterministic and auditable.
- ML can assist personalization but cannot override safety rules.
- Acts as a single source of truth for exercises and plans.

Integration model
-----------------
1) User describes goals and limitations in chat.
2) Conversational Brain (LLM) interprets this and produces structured JSON:
   - goal, limitations, available_time, level, etc.
3) Personalization Brain (Movement engine) takes this JSON and returns a deterministic plan.
4) Conversational Brain reads the plan and:
   - explains it in natural language,
   - provides motivation and safety reminders,
   - answers questions using RAG.
5) Safety Brain intercepts all outputs:
   - Conversational Brain output → Safety Brain → user
   - Personalization Brain output → Safety Brain → user
   - Detects red flags, overrides unsafe content, provides safe fallbacks.

Guardrails
----------
- Safety Brain has the highest authority and can override any output.
- Safety Brain uses deterministic rules (no LLM, no RAG) to detect red flags.
- Safety Brain can halt or escalate unsafe outputs.
- Conversational Brain (LLM):
  - Must never invent exercises.
  - Must only reference movement ids in the movement library.
  - Must not change plan parameters directly.
  - All outputs pass through Safety Brain before reaching user.
- Personalization Brain:
  - All suggestions pass through Safety Brain before reaching user.
- All calls, recommendations, and Safety Brain interventions should be logged for review.