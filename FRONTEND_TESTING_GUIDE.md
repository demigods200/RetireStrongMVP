# Frontend Testing Guide - Milestone 1

## ✅ What CAN Be Tested on Frontend

Most of the test plan can be tested through the frontend UI! Here's what you can test:

---

## 🎯 Complete Frontend Test Flow

### 1. **Authentication Flow** ✅

#### Signup
- **Page:** `http://localhost:3000/signup`
- **Test:**
  - Fill out signup form
  - Submit and verify redirect to `/verify`
  - Check form validation (email format, password strength)
  - Test error messages (duplicate email, etc.)

#### Email Verification
- **Page:** `http://localhost:3000/verify`
- **Test:**
  - Enter verification code
  - Test "Resend Code" button
  - Verify success/error messages
  - Check redirect to login after verification

#### Login
- **Page:** `http://localhost:3000/login`
- **Test:**
  - Login with correct credentials
  - Test invalid credentials error
  - Test unconfirmed user redirect to verification
  - Verify token storage in localStorage
  - Check redirect to `/today` after login

---

### 2. **User Onboarding Flow** ✅

#### Onboarding Wizard → Onboarding Result
- **Page:** `http://localhost:3000/onboarding`
- **Result Page:** `http://localhost:3000/onboarding/result` (automatic redirect)
- **Test:**
  - Complete all 4 steps:
    1. **About You** - Age, gender, location
    2. **Health & Activity** - Activity level, health conditions
    3. **Goals** - Select fitness goals
    4. **Schedule** - Preferred days and time
  - Test form validation on each step
  - Test "Previous" and "Next" buttons
  - Submit onboarding
  - **After submission, automatically redirected to result page showing:**
    - ✅ Profile summary (all your entered data)
    - ✅ Demographics, health context, goals, schedule
    - ✅ Completion status
    - ✅ Raw API response (click "View Raw API Response" to see JSON)
  - Continue to quiz

---

### 3. **Motivation Quiz Flow** ✅

#### Quiz Page → Quiz Result
- **Page:** `http://localhost:3000/motivation/quiz`
- **Result Page:** `http://localhost:3000/motivation/result` (automatic redirect)
- **Test:**
  - Verify all 12 questions load
  - Answer all questions
  - Test navigation (Previous/Next)
  - Test progress indicator
  - Submit quiz
  - **After submission, automatically redirected to result page showing:**
    - ✅ Coach persona (name, description, avatar)
    - ✅ Coaching style (formality, encouragement, directness, humor)
    - ✅ Motivation profile (primary/secondary motivators)
    - ✅ Score breakdown
    - ✅ Raw API response (click "View Raw API Response" to see JSON)
  - Continue to dashboard

---

### 4. **End-to-End User Journey** ✅

**Complete Flow Test:**
1. **Signup** → `/signup`
2. **Verify Email** → `/verify`
3. **Login** → `/login`
4. **Onboarding** → `/onboarding`
   - **Result:** `/onboarding/result` (shows API response)
5. **Quiz** → `/motivation/quiz`
   - **Result:** `/motivation/result` (shows API response)
6. **Dashboard** → `/today`

**Test:**
- [ ] Complete entire flow without errors
- [ ] **See onboarding API response at `/onboarding/result`**
- [ ] **See quiz API response at `/motivation/result`**
- [ ] Data persists between steps
- [ ] Navigation works correctly
- [ ] No console errors
- [ ] All API calls succeed

---

### 5. **Error Handling (Frontend)** ✅

**Test Scenarios:**
- [ ] Form validation errors (empty fields, invalid formats)
- [ ] API error messages display correctly
- [ ] Network errors handled gracefully
- [ ] 401 errors redirect to login
- [ ] 400 errors show specific messages
- [ ] 500 errors show generic error

---

### 6. **Protected Routes** ✅

**Test:**
- [ ] Access `/today` without login → redirects to `/login`
- [ ] Access `/onboarding` without login → redirects to `/login`
- [ ] Access `/motivation/quiz` without login → redirects to `/login`
- [ ] After login, can access all protected routes

---

## ❌ What CANNOT Be Tested on Frontend

These require AWS Console, CLI, or direct API testing:

### 1. **Infrastructure Verification**
- ❌ AWS Console checks (Cognito, DynamoDB, Lambda)
- ❌ AWS CLI commands
- ✅ **Workaround:** If everything works on frontend, infrastructure is likely OK

### 2. **Direct API Testing**
- ❌ Health endpoint (`GET /health`)
- ❌ Direct API calls with curl
- ✅ **Workaround:** Frontend makes these calls automatically

### 3. **Data Persistence Verification**
- ❌ Direct DynamoDB queries
- ✅ **Workaround:** Test by logging out/in and verifying data persists

### 4. **Lambda Function Verification**
- ❌ CloudWatch logs
- ❌ Lambda execution verification
- ✅ **Workaround:** If API works, Lambda is working

---

## 🚀 Quick Start: Frontend Testing

### Step 1: Start Frontend
```bash
cd apps/web
pnpm dev
```

### Step 2: Test Complete Flow

1. **Signup**
   - Go to `http://localhost:3000/signup`
   - Create account
   - Verify redirect to `/verify`

2. **Verify Email**
   - Enter code from email (or manually confirm in AWS Console)
   - Click "Verify Email"
   - Verify redirect to `/login`

3. **Login**
   - Enter credentials
   - Click "Sign In"
   - Verify redirect to `/today`

4. **Onboarding**
   - Complete all 4 steps
   - Submit onboarding
   - **See result page at `/onboarding/result`**
   - **Verify API response shows all saved data**
   - Continue to quiz

5. **Quiz**
   - Answer all 12 questions
   - Submit quiz
   - **See result page at `/motivation/result`**
   - **Verify API response shows persona and profile**
   - Continue to dashboard

6. **Dashboard**
   - Check `/today` page loads
   - Verify user data is displayed

---

## 📋 Frontend Test Checklist

### Authentication
- [ ] Signup form works
- [ ] Email verification works
- [ ] Resend code works
- [ ] Login works
- [ ] Logout works (if implemented)
- [ ] Protected routes redirect correctly

### Onboarding
- [ ] All 4 steps complete
- [ ] Form validation works
- [ ] Data submission works
- [ ] **Redirected to result page after completion**
- [ ] **Result page shows all saved data**
- [ ] **Raw API response visible on result page**
- [ ] Navigation works

### Quiz
- [ ] Questions load correctly
- [ ] All 12 questions display
- [ ] Navigation works
- [ ] Submission works
- [ ] **Redirected to result page after completion**
- [ ] **Result page shows persona and profile**
- [ ] **Raw API response visible on result page**
- [ ] Persona assignment works

### Error Handling
- [ ] Form validation errors show
- [ ] API errors display correctly
- [ ] Network errors handled
- [ ] User-friendly error messages

### Data Persistence
- [ ] User data persists after logout/login
- [ ] Onboarding data persists
- [ ] Quiz results persist
- [ ] Persona persists

---

## 🎯 Recommended Testing Approach

### Option 1: Frontend-Only Testing (Recommended for Quick Testing)
1. Test all frontend flows
2. Verify UI works correctly
3. Check browser console for errors
4. Test error scenarios
5. **Skip:** Infrastructure and direct API tests

### Option 2: Complete Testing (Recommended for Production)
1. Test all frontend flows
2. Test direct API endpoints (curl/Postman)
3. Verify infrastructure (AWS Console)
4. Check CloudWatch logs
5. Verify DynamoDB data

---

## ✅ Summary

**You can test ~80% of the test plan on the frontend!**

**Frontend Testing Covers:**
- ✅ Authentication (signup, login, verification)
- ✅ Onboarding flow → **Result page shows API response**
- ✅ Quiz flow → **Result page shows API response**
- ✅ End-to-end user journey
- ✅ Error handling
- ✅ Protected routes
- ✅ Data persistence (indirectly)
- ✅ **API response visibility for onboarding and quiz**

**Result Pages (Normal Flow):**
- ✅ `/onboarding/result` - Shows onboarding API response after completion
- ✅ `/motivation/result` - Shows quiz API response after completion

**Requires Separate Testing:**
- ❌ Infrastructure verification (AWS Console)
- ❌ Direct API testing (curl)
- ❌ CloudWatch logs
- ❌ Direct DynamoDB queries

**Recommendation:** Start with frontend testing. If everything works, your infrastructure is likely fine. Only test infrastructure directly if you encounter issues.

---

## 🐛 Troubleshooting

### Frontend Not Loading?
- Check `apps/web/.env.local` has correct API URL
- Verify frontend is running on port 3000
- Check browser console for errors

### API Calls Failing?
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify API Gateway is accessible
- Check browser Network tab for API responses

### Data Not Persisting?
- Check localStorage in browser DevTools
- Verify API calls are succeeding
- Check DynamoDB in AWS Console (if needed)

---

**Ready to test?** Start with the frontend - it covers most of what you need! 🚀

