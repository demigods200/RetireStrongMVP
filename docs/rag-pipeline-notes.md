RAG PIPELINE NOTES
==================

Goal
----
Turn Vitality Coach Resources, Exercise explanations and YouTube videos into a clean, queryable corpus that the coach engine can use for grounded answers.

Collections
-----------
- clinical_guidelines
  - WHO guidelines, ACSM older adults, US Physical Activity Guidelines.
- behavior_change
  - Tiny Habits, Atomic Habits, stages of change, Self Determination Theory, motivation docs.
- longevity_and_exercise
  - Outlive, Younger Next Year, similar books or summaries.
- internal_coaching_materials
  - Vitality Coach slides, brand manifesto, internal docs.
- movement_explanations
  - Text that explains why certain movements matter, linked to movement ids.

Pipeline
--------
1. Discover content
   - Store raw docs under content/vitality_raw.
   - Maintain JSON manifests under content/manifests/ with metadata (collection, source, topics).

2. Extract text
   - PDFs/DOCX -> text with headings.
   - YouTube -> transcript (API or ASR).

3. Clean
   - Normalize whitespace, remove boilerplate and duplicate headers.

4. Chunk
   - 300–800 token chunks for docs.
   - 30–90 second chunks for transcripts.
   - Attach metadata:
     - collection
     - source_title
     - topic tags (balance, stairs, fall_prevention, habits, confidence)
     - page or timestamp range
     - movementIds for movement_explanations when clear.

5. Embed and index
   - Use a single embedding model (Bedrock, OpenAI, etc).
   - Store in a vector DB with metadata filters.

6. Query usage
   - Coach-engine (Conversational Brain) queries RAG via content-rag/query/search:
     - For safety and dosage: filter collection=clinical_guidelines.
     - For habits and mindset: collection=behavior_change.
     - For long term framing: collection=longevity_and_exercise.
     - For tone: collection=internal_coaching_materials.
     - For specific movements: collection=movement_explanations with movementIds filter.
   - Note: Safety Brain does NOT use RAG. Safety Brain uses deterministic rules only.

Safety
------
- RAG supports explanations, not diagnosis.
- Answers stay general and conservative.
- Avoid long verbatim quotes from books; summarize instead.
- IMPORTANT: Safety enforcement is NOT done via RAG. Safety Brain uses deterministic
  rules to detect red flags and override unsafe outputs. RAG is only used by
  Conversational Brain for explanations and motivation, and those outputs are then
  filtered by Safety Brain before reaching the user.