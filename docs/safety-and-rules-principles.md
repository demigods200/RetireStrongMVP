SAFETY AND RULES PRINCIPLES
===========================

Purpose
-------
Define safety principles for exercise selection and coaching in Retire Strong, consistent with ACSM, WHO and PT‑reviewed materials. The system uses multi-layer safety with the Safety Brain as the final override layer.

Core principles
---------------
1) Multi-layer safety architecture
   - Safety Brain sits above both Conversational Brain and Personalization Brain.
   - Safety Brain has the highest authority and can override any output.
   - All outputs from Conversational Brain and Personalization Brain must pass through Safety Brain.
   - Safety Brain uses deterministic rules (no LLM, no RAG) to detect red flags and enforce compliance.

2) Safety first
   - When in doubt, choose the safer option or a regression.
   - Respect common limitations (knee pain, balance issues, dizziness, back pain).
   - Safety Brain provides safe fallback messages when content is blocked.

3) Deterministic decisions
   - Movement engine (Personalization Brain) makes all exercise choices.
   - Safety Brain makes all safety override decisions using deterministic rules.
   - Same inputs -> same plan and same safety checks.
   - Rules and thresholds are inspectable and versioned.

4) Movement library as source of truth
   - All exercises live in movement-library and come from Exercise Resources.
   - Each movement has metadata:
     - joints stressed, primary muscles, difficulty, contraindications, regressions, progressions.

5) Conversational Brain (LLM) as narrative layer only
   - LLM interprets goals, asks clarifying questions, explains plans and motivates.
   - It never creates new exercises or overrides safety rules.
   - It does not provide medical diagnosis.
   - All outputs are intercepted by Safety Brain before reaching user.

6) Explicit handling of limitations
   - Rules must codify exclusions and regressions, for example:
     - Knee pain -> limit deep knee flexion and loaded lunges.
     - Severe balance issues -> start with supported and static balance.
     - Dizziness -> avoid head‑down positions and rapid posture changes.
   - Safety Brain enforces these rules as final guardrail.

7) Conservative progression
   - Start lower and build up gradually as the user reports good tolerance.
   - Pain or negative feedback triggers regression, not progression.
   - Safety Brain can override unsafe progressions suggested by Personalization Brain.

8) Auditability
   - For each plan:
     - input profile,
     - key rules applied,
     - final movements,
     - Safety Brain interventions and overrides
     should be reconstructable from logs.

9) Zero unsafe outputs goal
   - Safety Brain ensures compliance with clinical safety constraints.
   - Safety Brain can halt or escalate unsafe outputs.
   - All Safety Brain interventions are logged for review.

Implications for code
---------------------
- safety-engine:
  - Highest authority layer with deterministic rule-based safety checks.
  - Detects red flags (medical advice, unsafe exercises, inappropriate content).
  - Overrides unsafe outputs from both Conversational Brain and Personalization Brain.
  - Enforces age-aware safety rules.
  - Provides safe fallback messages.
  - Can halt or escalate unsafe content.
  - No LLM or RAG dependencies.
  - All interventions logged for audit.
- movement-engine (Personalization Brain):
  - Encodes safety and progression rules.
  - No LLM or network calls.
  - Outputs pass through safety-engine before reaching user.
- coach-engine (Conversational Brain):
  - Validates JSON before calling the engine.
  - Uses only movement ids from plans when explaining.
  - Uses RAG to support explanations but keeps them general and safe.
  - All outputs pass through safety-engine before reaching user.
- domain-core:
  - Orchestrates flow: Coach/Personalization outputs → safety-engine → user.
  - Ensures all outputs pass through Safety Brain.
- UI:
  - Makes it easy to report pain or difficulty.
  - Communicates that this is general guidance, not a medical prescription.
  - Displays only Safety Brain-approved content.