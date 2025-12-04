# Step 3.2 Complete: Motivation Quiz and Coach Persona

## What Was Created

### 1. Motivation Engine Package (`packages/motivation-engine`)

**Core Logic:**
- `types.ts` - Type definitions for quiz answers, motivation profiles, personas, and tone configs
- `questions.ts` - 12 quiz questions covering 7 motivator types:
  - Achievement
  - Autonomy
  - Social
  - Health Fear
  - Independence
  - Mastery
  - Purpose
- `scoring.ts` - Pure logic to calculate motivation profile from quiz answers
- `pickPersona.ts` - Maps motivation profile to one of 7 coach personas:
  - Coach Alex (Achievement-focused)
  - Coach Sam (Autonomy-focused)
  - Coach Jordan (Social-focused)
  - Coach Morgan (Health fear-focused)
  - Coach Taylor (Independence-focused)
  - Coach Casey (Mastery-focused)
  - Coach Riley (Purpose-focused)

### 2. Domain Core Package (`packages/domain-core`)

**Extended User Model:**
- `MotivationProfile` interface - Primary motivator, secondary motivators, scores
- `CoachPersona` interface - Name, description, tone configuration
- Added `motivationProfile` and `coachPersona` fields to User model

**Services:**
- `UserService.setMotivationProfile()` - Saves motivation profile and persona to user record

### 3. Shared API Package (`packages/shared-api`)

**Schemas:**
- `QuizAnswerSchema` - Validation for individual quiz answers
- `QuizSubmissionSchema` - Validation for quiz submission request
- `MotivationProfileSchema` - Validation for motivation profile
- `CoachPersonaSchema` - Validation for coach persona
- `ToneConfigSchema` - Validation for tone configuration
- `QuizResponseSchema` - Response format for quiz submission
- `QuizQuestionsResponseSchema` - Response format for quiz questions

### 4. API Gateway Handlers (`apps/api-gateway`)

**Handlers:**
- `motivation/quiz.ts` - GET `/motivation/quiz` endpoint
  - Returns all quiz questions
- `motivation/submit.ts` - POST `/motivation/quiz/submit` endpoint
  - Accepts quiz answers
  - Calculates motivation profile using motivation-engine
  - Selects coach persona based on profile
  - Saves to user record via UserService
  - Returns profile and persona

### 5. Frontend Motivation Flow (`apps/web`)

**Pages:**
- `/motivation/quiz` - Quiz page with question flow
- `/motivation/result` - Persona reveal screen

**Components:**
- `MotivationQuiz` - Interactive quiz component with:
  - Progress bar
  - Question-by-question navigation
  - Answer selection with visual feedback
  - Previous/Next navigation
  - Form validation

**API Routes:**
- `/api/motivation/quiz` - Proxies to API Gateway GET endpoint
- `/api/motivation/submit` - Proxies to API Gateway POST endpoint

**Features:**
- ✅ 12-question quiz with multiple choice answers
- ✅ Progress tracking and visual indicator
- ✅ Smooth question transitions
- ✅ Answer persistence across navigation
- ✅ Persona reveal screen with coach details
- ✅ Persona widget in Navbar (shows persona name and avatar)
- ✅ Clean, elegant UI matching onboarding design

### 6. Shared UI Package (`packages/shared-ui`)

**Navbar Enhancement:**
- Added persona widget that displays:
  - Persona avatar (initials in circle)
  - Persona name (on desktop)
  - Loads from localStorage
  - Styled to match design system

## User Flow

1. User completes onboarding → Redirected to `/today`
2. User navigates to `/motivation/quiz` (or prompted after onboarding)
3. User answers 12 questions one at a time
4. Progress bar shows completion percentage
5. User can navigate back/forward through questions
6. On final question, "Complete" button submits quiz
7. System calculates motivation profile
8. System selects matching coach persona
9. User sees persona reveal screen at `/motivation/result`
10. Persona is saved to user record
11. Persona widget appears in Navbar
12. User continues to `/today` to start their plan

## Technical Details

- **Pure Logic**: motivation-engine has no network calls, fully testable
- **Type Safety**: All schemas use Zod 3.23.0 for validation
- **Persona Matching**: Based on primary motivator type
- **Tone Configuration**: Each persona has specific tone settings (formality, encouragement, directness, humor)
- **Data Persistence**: Persona stored in user record and localStorage for quick access

## Next Steps

- **Step 4.1:** Starter plan generation
  - Generate 3-day plan based on user profile
  - Display plan on Plan page
  - Match plan to user's goals, activity level, and schedule

---

**Step 3.2 Complete!** ✅

