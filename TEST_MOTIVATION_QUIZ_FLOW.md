# Testing Motivation Quiz Flow - Complete Guide

## ✅ Services Running

Both services are now running in the background:
- **API Gateway**: `http://localhost:3001` (Express server)
- **Web App**: `http://localhost:3000` (Next.js)

## 🧪 Complete Testing Flow

### Step 1: Open the Quiz Page

1. Open your browser
2. Navigate to: **http://localhost:3000/motivation/quiz**

**Expected:**
- ✅ Page loads with "Motivation Quiz" header
- ✅ Progress bar visible (showing 8.33% for first question)
- ✅ First question displays with 5 answer options
- ✅ "Previous" button is disabled
- ✅ "Next" button is disabled (until you select an answer)

### Step 2: Answer Questions

**For each question:**
1. Click on one of the 5 answer options
   - ✅ Selected answer shows blue border and left blue line
   - ✅ "Next" button becomes enabled
2. Click "Next" to proceed
   - ✅ Progress bar updates
   - ✅ Next question appears
   - ✅ Previous answer is saved

**Test Navigation:**
- Click "Previous" to go back
  - ✅ Previous question appears
  - ✅ Your previous answer is still selected
- Navigate forward and backward multiple times
  - ✅ All answers persist correctly

### Step 3: Complete the Quiz

1. Answer all 12 questions
   - ✅ Progress bar reaches 100%
   - ✅ On question 12, button says "Complete" instead of "Next"
2. Click "Complete"
   - ✅ Shows "Submitting..." loading state
   - ✅ Buttons are disabled during submission
   - ✅ Redirects to `/motivation/result`

### Step 4: View Persona Reveal

**Expected on result page:**
- ✅ "Meet Your Coach" header
- ✅ Persona card displays:
  - Avatar circle with initials (e.g., "CA" for Coach Alex)
  - Persona name (e.g., "Coach Alex")
  - Description text explaining the persona
  - Tone details section showing:
    - Formality level
    - Encouragement style
    - Directness level
    - Humor level
- ✅ "Continue to My Plan" button

### Step 5: Verify Persona Widget

1. Click "Continue to My Plan"
   - ✅ Redirects to `/today`
2. Check the Navbar
   - ✅ Persona widget appears in the top right
   - ✅ Shows avatar circle with initials
   - ✅ Shows persona name (on desktop)
3. Navigate to other pages (`/plan`, `/progress`, etc.)
   - ✅ Widget persists across all pages
4. Refresh the page
   - ✅ Widget still appears (loaded from localStorage)

## 🔍 Verification Checklist

- [ ] Quiz page loads successfully
- [ ] All 12 questions display correctly
- [ ] Answer selection works (blue border + left line)
- [ ] Progress bar updates smoothly
- [ ] Navigation (Previous/Next) works
- [ ] Answers persist when navigating back
- [ ] Quiz submission works
- [ ] Persona reveal screen displays
- [ ] Persona widget appears in Navbar
- [ ] Widget persists across pages
- [ ] Widget persists after page refresh

## 🐛 Troubleshooting

### Quiz questions don't load

**Check API Gateway:**
```bash
curl http://localhost:3001/motivation/quiz
```

**Should return:** JSON with 12 questions

**If error:** Check Terminal 1 (API Gateway) for error messages

### Submission fails

**Check browser console:**
- Open DevTools (F12) → Console tab
- Look for error messages

**Check Network tab:**
- Open DevTools (F12) → Network tab
- Find `/api/motivation/submit` request
- Check status code (should be 200)
- Check response (should have `success: true`)

### Persona widget doesn't appear

**Check localStorage:**
1. Open DevTools (F12) → Application tab
2. Go to Local Storage → `http://localhost:3000`
3. Look for `coachPersona` key
4. Should contain JSON with persona data

## 📊 Expected Personas

Based on your answers, you'll get one of these personas:

1. **Coach Alex** - Achievement-focused
2. **Coach Sam** - Autonomy-focused
3. **Coach Jordan** - Social-focused
4. **Coach Morgan** - Health fear-focused
5. **Coach Taylor** - Independence-focused
6. **Coach Casey** - Mastery-focused
7. **Coach Riley** - Purpose-focused

## 🎯 Quick Test Commands

```bash
# Test API Gateway health
curl http://localhost:3001/health

# Test quiz questions endpoint
curl http://localhost:3001/motivation/quiz

# Test web app
curl http://localhost:3000
```

## 📝 Notes

- All data is stored in localStorage for now (no backend persistence without AWS)
- Persona is calculated based on your primary motivator type
- You can retake the quiz by clearing localStorage and navigating to `/motivation/quiz` again

---

**Ready to test!** Open **http://localhost:3000/motivation/quiz** in your browser.

