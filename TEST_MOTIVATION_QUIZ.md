# Testing Motivation Quiz on Frontend

## Prerequisites

1. **Build all packages:**
   ```bash
   pnpm -r build
   ```

2. **Start API Gateway (Terminal 1):**
   ```bash
   cd apps/api-gateway
   pnpm dev
   ```
   This will start the API Gateway on `http://localhost:3001`

3. **Start Web App (Terminal 2):**
   ```bash
   cd apps/web
   pnpm dev
   ```
   This will start the Next.js app on `http://localhost:3000`

## Testing Steps

### 1. Navigate to Quiz Page

1. Open your browser and go to: `http://localhost:3000`
2. Make sure you're logged in (or create a test account)
3. Navigate to: `http://localhost:3000/motivation/quiz`

### 2. Test Quiz Flow

**Expected Behavior:**
- ✅ Page loads with "Motivation Quiz" header
- ✅ Progress bar shows at 0% (or 8.33% for first question)
- ✅ First question displays with 5 answer options
- ✅ Question counter shows "Question 1 of 12"

**Test Answer Selection:**
1. Click on any answer option
   - ✅ Selected answer should show blue border and left blue line
   - ✅ "Next" button should become enabled
2. Click "Next" button
   - ✅ Progress bar should update
   - ✅ Next question should appear
   - ✅ Previous answer should be saved

**Test Navigation:**
1. Answer a few questions and click "Previous"
   - ✅ Should go back to previous question
   - ✅ Previous answer should still be selected
2. Navigate forward and backward multiple times
   - ✅ All answers should persist

**Test Final Question:**
1. Answer all 12 questions
   - ✅ Progress bar should reach 100%
   - ✅ On question 12, button should say "Complete"
2. Click "Complete"
   - ✅ Should show "Submitting..." loading state
   - ✅ Should redirect to `/motivation/result`

### 3. Test Persona Reveal Screen

**Expected Behavior:**
- ✅ Page shows "Meet Your Coach" header
- ✅ Persona card displays with:
  - Avatar circle with initials
  - Persona name (e.g., "Coach Alex")
  - Description text
  - Tone details section
- ✅ "Continue to My Plan" button is visible

**Test Navigation:**
1. Click "Continue to My Plan"
   - ✅ Should redirect to `/today`

### 4. Test Persona Widget in Navbar

**Expected Behavior:**
- ✅ After quiz completion, persona widget appears in Navbar
- ✅ Widget shows avatar circle with initials
- ✅ On desktop: shows persona name next to avatar
- ✅ Widget persists across page navigation

**Test Persistence:**
1. Navigate to different pages (`/today`, `/plan`, etc.)
   - ✅ Widget should remain visible
2. Refresh the page
   - ✅ Widget should still appear

## Troubleshooting

### If quiz questions don't load:

1. **Check API Gateway is running:**
   ```bash
   curl http://localhost:3001/motivation/quiz
   ```
   Should return JSON with questions.

2. **Check API Gateway logs:**
   Look at Terminal 1 (API Gateway) for any error messages.

3. **Check browser console:**
   Open browser DevTools (F12) → Console tab
   Look for any error messages.

### If submission fails:

1. **Check API Gateway logs:**
   Look for errors in Terminal 1.

2. **Check network tab:**
   Open browser DevTools → Network tab
   Check the `/api/motivation/submit` request:
   - Status code should be 200
   - Response should contain `success: true`

### Common Issues:

**Issue:** "Failed to load questions"
- **Solution:** Make sure API Gateway is running on port 3001

**Issue:** "500 Internal Server Error"
- **Solution:** Check that all packages are built (`pnpm -r build`)

**Issue:** Persona widget doesn't appear
- **Solution:** Check localStorage in browser DevTools → Application → Local Storage
  - Should have `coachPersona` key with JSON data

## Quick Test Checklist

- [ ] API Gateway running on port 3001
- [ ] Web app running on port 3000
- [ ] Can access `/motivation/quiz` page
- [ ] Questions load successfully
- [ ] Can select answers
- [ ] Can navigate between questions
- [ ] Progress bar updates correctly
- [ ] Can submit quiz
- [ ] Persona reveal screen displays
- [ ] Persona widget appears in Navbar

## Expected API Responses

### GET /motivation/quiz
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q1",
        "text": "What matters most to you...",
        "category": "purpose",
        "options": [
          { "value": 1, "label": "Feeling stronger..." },
          ...
        ]
      },
      ...
    ]
  }
}
```

### POST /motivation/quiz/submit
```json
{
  "success": true,
  "data": {
    "profile": {
      "primaryMotivator": "achievement",
      "secondaryMotivators": ["autonomy", "mastery"],
      "scores": { ... }
    },
    "persona": {
      "name": "Coach Alex",
      "description": "Goal-oriented and data-driven...",
      "tone": { ... }
    }
  }
}
```

