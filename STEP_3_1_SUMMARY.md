# Step 3.1 Complete: Onboarding Profile

## What Was Created

### 1. Domain Core Package (`packages/domain-core`)

**Extended User Model:**
- `Demographics` - Age, gender, location
- `HealthContext` - Activity level, health conditions, mobility limitations, equipment
- `OnboardingData` - Complete onboarding information
- `SchedulePreferences` - Preferred days, time, session duration

**Services:**
- `UserService.completeOnboarding()` - Completes user onboarding

**Repositories:**
- `UserRepo.updateUser()` - Updates user in DynamoDB

### 2. Shared API Package (`packages/shared-api`)

**Schemas:**
- `DemographicsSchema` - Zod validation for demographics
- `HealthContextSchema` - Zod validation for health context
- `SchedulePreferencesSchema` - Zod validation for schedule
- `OnboardingDataSchema` - Complete onboarding data validation
- `OnboardingRequestSchema` - Request validation
- `OnboardingResponseSchema` - Response format

### 3. API Gateway Handler (`apps/api-gateway`)

**Handler:**
- `users/onboarding.ts` - POST `/users/onboarding` endpoint
- Validates onboarding data
- Calls `UserService.completeOnboarding()`
- Returns success/error response

**Template:**
- Added `OnboardingFunction` to `template.yaml`

### 4. Frontend Onboarding (`apps/web`)

**Components:**
- `OnboardingWizard` - Multi-step wizard with:
  - Progress indicator (4 steps)
  - Step 1: Demographics (age, gender, location)
  - Step 2: Health & Activity (activity level, health conditions)
  - Step 3: Goals (multiple selection)
  - Step 4: Schedule (days, time, duration)
  - Navigation (Previous/Next buttons)
  - Form state management

**Pages:**
- `/onboarding` - Onboarding wizard page
- Updated `/today` - Shows welcome message after onboarding

**API Routes:**
- `/api/users/onboarding` - Proxies to API Gateway

**Features:**
- ✅ Multi-step wizard with progress indicator
- ✅ Form validation
- ✅ Local form state management
- ✅ Redirects to `/today?onboarding=complete` after completion
- ✅ Welcome message on Today page
- ✅ 50+ friendly design (large inputs, clear labels)

## User Flow

1. User signs up → Redirects to `/onboarding`
2. User completes 4-step wizard:
   - Demographics
   - Health & Activity
   - Goals
   - Schedule
3. On completion → Redirects to `/today?onboarding=complete`
4. Today page shows welcome message

## Next Steps

- **Step 3.2:** Motivation quiz and coach persona assignment
- After onboarding, users will complete motivation quiz to get their coach persona

---

**Step 3.1 Complete!** ✅

